const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const express = require("express")

// Serveur Render
const app = express()
app.get("/", (_, r) => r.send("Bot en ligne"))
app.listen(process.env.PORT || 3000)

// Bot
async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("session")
  const sock = makeWASocket({ auth: state })
  sock.ev.on("creds.update", saveCreds)

  // Pairing
  if (!sock.authState.creds.registered) {
    const code = await sock.requestPairingCode(process.env.NUMBER)
    console.log("PAIR CODE :", code)
  }

  // Messages
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const m = messages[0]
    if (!m.message || m.key.fromMe) return

    const text = m.message.conversation || m.message.extendedTextMessage?.text
    const from = m.key.remoteJid

    if (text === ".menu") {
      await sock.sendMessage(from, {
        text: `🤖 *MINI BOT*
        
.menu – afficher le menu
.ping – tester le bot
.owner – info bot`
      })
    }

    if (text === ".ping") {
      await sock.sendMessage(from, { text: "🏓 Pong !" })
    }

    if (text === ".owner") {
      await sock.sendMessage(from, { text: "👑 Bot by toi" })
    }
  })
}

start()
