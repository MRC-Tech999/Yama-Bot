const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  generateWAMessageFromContent,
  proto,
  jidNormalizedUser,
  makeInMemoryStore
} = require('@whiskeysockets/baileys');

const readline = require('readline');
const fs = require('fs');
const path = require('path');
const P = require('pino');

const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('YAMA_SESSION');
  const { version, isLatest } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger: P({ level: 'silent' })
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (connection === 'open') {
      console.log('\n✅ Connected to WhatsApp!');
      await sock.sendMessage(sock.user.id, {
        text: `✅ Connection successfully!
Finished syncing with WhatsApp on Safari or Chrome (YAMA-v1)

Channel officiel :
https://whatsapp.com/channel/0029Vb6J7O684Om8DdNfvL2N
Créateur : EMPEROR SUKUNA`
      });
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const body = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
    const command = body.trim().toLowerCase();

    if (command === '.menu') {
      const hour = new Date().getHours();
      let greeting = 'Good evening';
      if (hour < 12) greeting = 'Good morning';
      else if (hour < 18) greeting = 'Good afternoon';

      const name = msg.pushName || 'User';
      const menuText = `
${greeting}, ${name}
Voici les commandes de YAMA (Bot officiel de EMPEROR SUKUNA) :

╭───「 Groupes 」
│• .ka - Supprime tous les membres
│• .add +229xxxxxx - Ajouter un membre
│• .promote @ - Promouvoir admin
│• .demote @ - Retirer admin
│• .aa - Autoadmin
│• .gpp - Changer photo de groupe
│• .antideletemembre - Protection suppression
│• .antidemote - Protection contre retrait admin

╭───「 Perso 」
│• .pp - Changer ta photo
│• .menu - Voir ce menu

╭───「 Téléchargement 」
│• auto TikTok / YouTube / Insta / Facebook

╰────「 Channel 」
https://whatsapp.com/channel/0029Vb6J7O684Om8DdNfvL2N
      `;

      await sock.sendMessage(sender, { text: menuText });
    }

    // Ici, tu ajouteras les autres commandes en les important
  });
};

startBot();
