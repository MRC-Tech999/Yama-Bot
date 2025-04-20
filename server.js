const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const app = express();
app.use(cors());
const PORT = 3000;

app.get('/generate-code', async (req, res) => {
    const phone = req.query.phone;
    if (!phone) return res.status(400).send({ error: 'Numéro manquant' });

    const sessionName = `yama_${uuidv4().replace(/-/g, '')}`;
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${sessionName}`);

    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, isNewLogin } = update;
        if (connection === 'open') {
            console.log(`Bot connecté : ${sessionName}`);
            res.send({
                code: state.creds?.pairingCode || 'XXXXX',
                sessionId: sessionName,
                message: 'Connection successfully!',
                creator: 'EMPEROR SUKUNA',
                channel: 'https://whatsapp.com/channel/0029Vb6J7O684Om8DdNfvL2N'
            });
        }
    });

    sock.ev.on('creds.update', saveCreds);
});

app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`);
});
