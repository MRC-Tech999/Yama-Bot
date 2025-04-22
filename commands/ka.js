module.exports = {
  command: 'ka',
  description: 'Supprimer tout le monde du groupe (admin uniquement)',
  category: 'groupe',

  execute: async (sock, m, args, store) => {
    const groupMetadata = await sock.groupMetadata(m.key.remoteJid)
    const senderId = m.key.participant || m.key.remoteJid
    const participants = groupMetadata.participants

    const sender = participants.find(p => p.id === senderId)
    if (!sender?.admin) {
      return sock.sendMessage(m.key.remoteJid, { text: 'Tu dois être admin pour utiliser cette commande.' }, { quoted: m })
    }

    const botId = sock.user.id.split(':')[0]
    const nonAdmins = participants.filter(p => p.id !== senderId && p.id !== botId)

    for (const participant of nonAdmins) {
      try {
        await sock.groupParticipantsUpdate(m.key.remoteJid, [participant.id], 'remove')
      } catch (e) {
        console.log(`Erreur lors du kick de ${participant.id}`, e)
      }
    }

    await sock.sendMessage(m.key.remoteJid, { text: 'Tous les membres ont été supprimés du groupe.' }, { quoted: m })
  }
                                     }
                              
