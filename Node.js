const express = require('express')
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
const { delay } = require('@whiskeysockets/baileys/lib/Utils')
const crypto = require('crypto')

const app = express()
app.use(express.json())

// Génère un ID de session
function generateSessionId() {
  return `levanter_${crypto.randomBytes(16).toString('hex')}`
}

app.post('/pair', async (req, res) => {
  const { phone } = req.body
  if (!phone) return res.json({ success: false, message: 'Numéro manquant.' })

  try {
    const { state, saveCreds } = await useMultiFileAuthState(`./sessions/${phone}`)
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ['YAMA-BOT', 'Safari', '1.0.0'],
    })

    sock.ev.on('connection.update', async ({ connection, pairingCode }) => {
      if (pairingCode) {
        res.json({ success: true, pairingCode })

        // Attente que la session soit connectée
        sock.ev.once('creds.update', async () => {
          const sessionId = generateSessionId()
          sock.sendMessage(`${phone}@s.whatsapp.net`, {
            text: `✅ *Connection successfully!*\n\n🔑 *Session ID* : ${sessionId}\n\n🔗 *Channel WhatsApp* : https://whatsapp.com/channel/0029Vb6J7O684Om8DdNfvL2N\n👤 *Créateur* : EMPEROR SUKUNA\n📞 *Contact* : +22960000000`
          })
        })
      }
    })
  } catch (e) {
    console.log(e)
    res.json({ success: false, message: 'Erreur lors de la génération du code.' })
  }
})

app.listen(3000, () => {
  console.log('Serveur lancé sur http://localhost:3000')
})
