// Définir WebCrypto global pour Baileys
globalThis.crypto = require('node:crypto').webcrypto;

const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  generatePairingCode,
  makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const { Boom } = require('@hapi/boom');
const P = require('pino');
const fs = require('fs');

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    printQRInTerminal: true,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P().info)
    },
    browser: ['YAMA-Bot', 'Safari', '1.0.0'],
    logger: P({ level: 'silent' })
  });

  // Génère le code de pairage si aucun ID n’est présent
  if (!sock.authState.creds.registered) {
    const phoneNumber = '237xxxxxxxx'; // Remplace ceci par l’entrée utilisateur (ou ajoute une saisie console)
    const code = await generatePairingCode(phoneNumber, sock);
    console.log(`PAIRING CODE (à mettre dans WhatsApp > Appareils connectés): ${code}`);
  }

  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('Bot connecté avec succès');

      const jid = sock.user.id;
      const message = {
        text: `✅ *Connection successfully!*\n\n🧠 Finished syncing with WhatsApp (YAMA-v1)\n\n🔗 Suis notre chaîne officielle :\nhttps://whatsapp.com/channel/0029Vb6J7O684Om8DdNfvL2N\n\n👑 Créateur : EMPEROR SUKUNA`
      };
      await sock.sendMessage(jid, message);
    }

    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('Déconnecté...', lastDisconnect?.error);
      if (shouldReconnect) {
        startBot();
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);
};

startBot();
    
