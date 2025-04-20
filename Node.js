const express = require('express')
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const crypto = require('crypto')

const app = express()
app.use(express.json())  // Pour accepter les données JSON
app.use(express.static('public')) // Si vous avez des fichiers statiques à servir

// Fonction pour générer un ID de session unique
function generateSessionId() {
  return `levanter_${crypto.randomBytes(16).toString('hex')}`
}

app.post('/pair', async (req, res) => {
  const { phone } = req.body
  if (!phone) return res.json({ success: false, message: 'Numéro manquant.' })

  try {
    // Création de l'authentification via Baileys
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${phone}`)
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['YAMA-BOT', 'Safari', '1.0.0'],
    })

    sock.ev.on('connection.update', async ({ connection, pairingCode, lastDisconnect }) => {
      if (pairingCode) {
        // Si le code de pairage est généré, renvoyer à l'utilisateur
        return res.json({ success: true, pairingCode })
      }

      if (connection === 'close' || lastDisconnect?.error) {
        return res.json({ success: false, message: 'Échec de la connexion avec WhatsApp' })
      }
    })
    
    sock.ev.once('creds.update', async () => {
      const sessionId = generateSessionId()

      // Vous pouvez envoyer un message de confirmation
      sock.sendMessage(`${phone}@s.whatsapp.net`, {
        text: `✅ *Connection successfully!*\n\n🔑 *Session ID* : ${sessionId}\n\n🔗 *Channel WhatsApp* : https://whatsapp.com/channel/0029Vb6J7O684Om8DdNfvL2N\n👤 *Créateur* : EMPEROR SUKUNA\n📞 *Contact* : +22960000000`
      })
    })
    
  } catch (e) {
    console.log(e)
    res.json({ success: false, message: 'Erreur lors de la génération du code.' })
  }
})

app.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000')
})
