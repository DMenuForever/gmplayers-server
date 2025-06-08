const express = require('express')
const app = express()
const port = 8080

app.use(express.json())

const players = {}
const props = {}
const chatMessages = []
const TIMEOUT = 20000
const MAX_CHAT_MESSAGES = 50
const MAX_PROPS = 100

setInterval(() => {
    const now = Date.now()
    for (const id in players) {
        if (now - players[id].lastUpdate > TIMEOUT) {
            console.log(`Player ${id} timed out`)
            delete players[id]
            for (const propId in props) {
                if (props[propId].ownerId === id) delete props[propId]
            }
        }
    }
}, 5000)

app.post('/sync', (req, res) => {
    const { id, pos, ang, weapon, map, state, steamid, nickname, props: clientProps } = req.body
    if (!id) return res.status(400).json({ error: 'Missing ID' })

    players[id] = {
        pos, ang, weapon, map, state, steamid, nickname,
        lastUpdate: Date.now()
    }

    if (clientProps) {
        for (const prop of clientProps) {
            if (!props[prop.id] && Object.keys(props).length >= MAX_PROPS) continue
            if (!props[prop.id]) {
                props[prop.id] = {
                    model: prop.model,
                    ownerId: id
                }
            }
            props[prop.id].pos = prop.pos
            props[prop.id].ang = prop.ang
            props[prop.id].velocity = prop.velocity || { x: 0, y: 0, z: 0 }
            props[prop.id].lastUpdate = Date.now()
        }
    }

    const otherPlayers = {}
    for (const pid in players) {
        if (pid !== id) otherPlayers[pid] = players[pid]
    }

    res.json({ players: otherPlayers, props, chat: chatMessages })
})

app.post('/chat', (req, res) => {
    const { id, nickname, message } = req.body
    if (!id || !nickname || !message) return res.status(400).json({ error: 'Missing data' })

    const chat = {
        nickname,
        message,
        timestamp: Date.now()
    }

    chatMessages.push(chat)
    if (chatMessages.length > MAX_CHAT_MESSAGES) chatMessages.shift()

    console.log(`Chat [${nickname}]: ${message}`)
    res.json({ status: 'OK' })
})

app.get('/status', (req, res) => {
    const online = Object.entries(players).map(([id, p]) => ({
        id, nickname: p.nickname, steamid: p.steamid, map: p.map
    }))
    res.json({ online })
})

app.get('/', (req, res) => {
    res.send('OK')
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
