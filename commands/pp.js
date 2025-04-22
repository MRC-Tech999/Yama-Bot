const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "pp",
  description: "Change la photo de profil du bot",
  execute: async (msg, sock) => {
    const from = msg.key.remoteJid;

    if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      return sock.sendMessage(from, { text: "Répond à une image avec la commande .pp" });
    }

    const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
    const buffer = await downloadMediaMessage(
      { message: quoted, key: msg.key },
      "buffer",
      {},
      { logger: console, reuploadRequest: sock.updateMediaMessage }
    );

    const filePath = path.join(__dirname, 'pp.jpg');
    fs.writeFileSync(filePath, buffer);

    await sock.updateProfilePicture(sock.user.id, {
      url: filePath,
      mimetype: "image/jpeg"
    });

    fs.unlinkSync(filePath);

    await sock.sendMessage(from, { text: "Photo de profil du bot mise à jour !" });
  }
};
