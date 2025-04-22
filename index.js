const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, generatePairingCode, delay, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const P = require('pino');
const fs = require('fs');
const crypto = require('crypto').webcrypto;

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_yama');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P().info)
        },
        logger: P({ level: 'silent' }),
        browser: ['YAMA-Bot', 'Safari', '1.0.0'],
    });

    if (!sock.authState.creds.registered) {
        const number = process.env.NUMBER || 'PUT_PHONE_NUMBER_HERE';
        const code = await generatePairingCode(number, sock);
        console.log(`PAIR CODE for ${number} : ${code}`);
        console.log("Copiez ce code dans WhatsApp > Appareils connectés > Utiliser un code");
    }

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            console.log('✅ Connection successfully!');

            const sessionId = 'YAMA_' + crypto.randomUUID().replace(/-/g, '');
            console.log('SESSION ID : ' + sessionId);

            const jid = Object.keys(sock.authState.creds.myJid)[0];
            await sock.sendMessage(jid, {
                text: `✅ Bot YAMA connecté avec succès !\n\nSession ID : *${sessionId}*\n\nSuivez-nous ici : https://whatsapp.com/channel/0029Vb6J7O684Om8DdNfvL2N\n\nCréateur : *EMPEROR SUKUNA*`
            });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error = new Boom(lastDisconnect?.error))?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Déconnecté...', lastDisconnect.error, 'Reconnexion ?', shouldReconnect);
            if (shouldReconnect) {
                startBot();
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

startBot();
      
