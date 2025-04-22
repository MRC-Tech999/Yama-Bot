const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "gpp",
  description: "Change la photo de profil du groupe",
  execute: async (msg, sock) => {
    const groupId = msg.key.remoteJid;

    if (!msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
      return sock.sendMessage(groupId, { text: "Répond à une image avec la commande .gpp" });
    }

    const quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage;
    const buffer = await downloadMediaMessage(
      { message: quoted, key: msg.key },
      "buffer",
      {},
      { logger: console, reuploadRequest: sock.updateMediaMessage }
    );

    const filePath = path.join(__dirname, 'temp.jpg');
    fs.writeFileSync(filePath, buffer);

    await sock.groupUpdateProfilePicture(groupId, {
      url: filePath,
      mimetype: "image/jpeg"
    });

    fs.unlinkSync(filePath);

    await sock.sendMessage(groupId, { text: "Photo du groupe changée avec succès !" });
  }
};
