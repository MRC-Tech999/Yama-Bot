module.exports = {
  name: "ka",
  description: "Supprime tous les membres d’un groupe (sauf le propriétaire du bot)",
  execute: async (msg, sock) => {
    const groupId = msg.key.remoteJid;

    if (!msg.key.participant) return sock.sendMessage(groupId, { text: "Commande réservée aux groupes." });
    const metadata = await sock.groupMetadata(groupId);
    const sender = msg.key.participant;
    
    if (!metadata.participants.find(p => p.id === sender && p.admin)) {
      return sock.sendMessage(groupId, { text: "Tu dois être admin pour utiliser cette commande." });
    }

    const botNumber = sock.user.id;
    const participantsToRemove = metadata.participants
      .filter(p => p.id !== botNumber)
      .map(p => p.id);

    for (const id of participantsToRemove) {
      await sock.groupParticipantsUpdate(groupId, [id], "remove");
      await new Promise(r => setTimeout(r, 1500));
    }

    await sock.sendMessage(groupId, { text: "Tous les membres ont été supprimés." });
  }
};
        
