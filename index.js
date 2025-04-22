const { default: makeWASocket, useMultiFileAuthState, generateWAMessageFromContent, jidNormalizedUser } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const { delay } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const P = require('pino');

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('YAMA_SESSION');
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: P({ level: 'silent' }),
    browser: ['YAMA-BOT', 'Chrome', '1.0.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log('\n[SCAN] QR Code détecté. Scanne-le dans WhatsApp > Appareils connectés > Lier un appareil.\n');
    }

    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('[CONNEXION FERMÉE]', lastDisconnect?.error, '\n=> Reconnexion :', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === 'open') {
      console.log('[YAMA] Connecté avec succès!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const from = msg.key.remoteJid;
    const body = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "";

    // Charger dynamiquement les commandes
    if (body.startsWith(".")) {
      const command = body.split(" ")[0].substring(1);
      const filePath = path.join(__dirname, "commands", `${command}.js`);

      if (fs.existsSync(filePath)) {
        const cmd = require(filePath);
        try {
          await cmd.execute(msg, sock);
        } catch (e) {
          console.error(`Erreur dans la commande .${command} :`, e);
        }
      } else {
        await sock.sendMessage(from, { text: "Commande inconnue." });
      }
    }
  });
};

startBot();
        
