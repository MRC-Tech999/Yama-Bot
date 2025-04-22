const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore, fetchLatestBaileysVersion, generateWAMessageFromContent, proto, DisconnectReason } = require('@whiskeysockets/baileys')
const { Boom } = require('@hapi/boom')
const P = require('pino')
const fs = require('fs')
const path = require('path')

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState('session')
  const { version, isLatest } = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
    },
    browser: ['YAMA-BOT', 'Safari', '1.0.0']
  })

  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode("numéro@s.whatsapp.net") // Remplace "numéro" par ton numéro sans +
    console.log(`Code d'appairage : ${code}`)
  }

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      console.log('Déconnecté...', lastDisconnect.error, 'Reconnexion :', shouldReconnect)
      if (shouldReconnect) {
        startBot()
      }
    } else if (connection === 'open') {
      console.log('YAMA est connecté avec succès !')
    }
  })
}

startBot()
                                                           
