const moment = require('moment-timezone')
moment.tz.setDefault('Africa/Abidjan')

module.exports = {
  command: 'menu',
  description: 'Affiche le menu avec les commandes du bot.',
  category: 'général',

  execute: async (sock, m, args) => {
    const date = moment().format('dddd, MMMM Do YYYY')
    const time = moment().format('HH:mm')
    const hour = moment().hour()
    const name = m.pushName || 'Utilisateur'
    
    let greeting = 'Hello'
    if (hour < 12) greeting = 'Good morning'
    else if (hour < 18) greeting = 'Good afternoon'
    else greeting = 'Good evening'

    const message = `
${greeting} ${name}!
Today is *${date}* | *${time}*

I am *YAMA*, bot by *EMPEROR SUKUNA*.

Follow our official channel:
https://whatsapp.com/channel/0029Vb6J7O684Om8DdNfvL2N

📦 *Menu des commandes :*

📁 *Groupe*
• .ka - Supprimer tout le monde
• .gpp - Changer photo du groupe
• .add - Ajouter un membre
• .promote - Promouvoir un admin
• .demote - Retirer un admin
• .aa - Auto admin
• .antideletemembre
• .antidemote

🎵 *Download*
• tiktok auto download
• youtube mp3/mp4
• instagram / facebook

🧑 *Profil*
• .pp - Changer la photo de profil

Tape une commande pour l'utiliser !

Bot by *EMPEROR SUKUNA*
    `

    await sock.sendMessage(m.key.remoteJid, { text: message }, { quoted: m })
  }
  }
      
