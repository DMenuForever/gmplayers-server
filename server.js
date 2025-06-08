// server.js
const express = require('express')
const app = express()
const port = 8080

app.use(express.json())

const players = {}, props = {}, chatMessages = []
const TIMEOUT = 20000
const MAX_CHAT_MESSAGES = 50
const MAX_PROPS = 100

setInterval(() => {
  const now = Date.now()
  for (const id in players) {
    if (now - players[id].lastUpdate > TIMEOUT) {
      delete players[id]
      for (const pid in props) {
        if (props[pid].ownerId === id) delete props[pid]
      }
    }
  }
}, 5000)

app.post('/sync', (req, res) => {
  const { id, pos, ang, eyeAng, weapon, map, state, steamid, nickname, props: cProps } = req.body
  if (!id) return res.status(400).json({ error: 'no id' })

  players[id] = { pos, ang, eyeAng, weapon, map, state, steamid, nickname, lastUpdate: Date.now() }

  if (cProps) for (const p of cProps) {
    if (!props[p.id] && Object.keys(props).length >= MAX_PROPS) continue
    if (!props[p.id]) props[p.id] = { model: p.model, ownerId: id }
    props[p.id].pos = p.pos; props[p.id].ang = p.ang;
    props[p.id].velocity = p.velocity || { x: 0, y: 0, z: 0 }
    props[p.id].lastUpdate = Date.now()
  }

  const others = {}
  for (const pid in players) if (pid !== id) others[pid] = players[pid]

  res.json({ players: others, props, chat: chatMessages })
})

app.post('/chat', (req, res) => {
  const { id, nickname, message } = req.body
  if (!id || !nickname || !message) return res.status(400).json({ error: 'Missing data' })
  const msg = { nickname, message, timestamp: Date.now() }
  chatMessages.push(msg)
  if (chatMessages.length > MAX_CHAT_MESSAGES) chatMessages.shift()
  res.json({ status: 'OK' })
})

app.get('/status', (req, res) => {
  const online = Object.entries(players).map(([i, d]) => ({ id: i, nickname: d.nickname, steamid: d.steamid, map: d.map }))
  res.json({ online })
})

app.get('/', (req, res) => res.send('OK'))
app.listen(port, () => console.log(`Listening on ${port}`))
