const express = require('express')
const app = express()
const port = 8080

app.use(express.json())

const players = {}
const props = {}
const chatMessages = []
const TIMEOUT = 20 * 1000
const MAX_CHAT_MESSAGES = 50
const MAX_PROPS = 100

setInterval(() => {
    const currentTime = Date.now()
    for (const id in players) {
        const player = players[id]
        if (currentTime - player.lastUpdate > TIMEOUT) {
            console.log(`Player ${id} timed out and is being removed`)
            delete players[id]
            for (const propId in props) {
                if (props[propId].ownerId === id) {
                    delete props[propId]
                }
            }
        }
    }
}, 5000)

app.post('/sync', (req, res) => {
    const { id, pos, ang, weapon, map, state, steamid, nickname, props: clientProps } = req.body
    if (!id) return res.status(400).json({ error: 'no id' })

    players[id] = {
        pos: pos || { x: 0, y: 0, z: 0 },
        ang: ang || { p: 0, y: 0, r: 0 },
        weapon: weapon || 'none',
        map: map || 'unknown',
        state: state || 'idle',
        steamid: steamid || 'unknown',
        nickname: nickname || 'Unknown',
        lastUpdate: Date.now()
    }

    if (clientProps) {
        for (const prop of clientProps) {
            if (Object.keys(props).length >= MAX_PROPS) break;
            props[prop.id] = {
                model: prop.model,
                pos: prop.pos,
                ang: prop.ang,
                velocity: prop.velocity || { x: 0, y: 0, z: 0 },
                ownerId: id,
                lastUpdate: Date.now()
            }
        }
    }

    const others = {}
    for (const [pid, data] of Object.entries(players)) {
        if (pid !== id) others[pid] = data
    }

    res.json({ players: others, props, chat: chatMessages })
})

app.post('/chat', (req, res) => {
    const { id, nickname, message } = req.body
    if (!id || !message || !nickname) return res.status(400).json({ error: 'Missing id, nickname, or message' })

    const chatMessage = {
        nickname: nickname,
        message: message,
        timestamp: Date.now()
    }

    chatMessages.push(chatMessage)
    if (chatMessages.length > MAX_CHAT_MESSAGES) {
        chatMessages.shift()
    }

    console.log(`Chat from ${nickname} (${id}): ${message}`)
    res.json({ status: 'OK' })
})

app.get('/status', (req, res) => {
    const online = Object.entries(players).map(([id, data]) => ({
        id,
        map: data.map,
        nickname: data.nickname,
        steamid: data.steamid
    }))
    res.json({ online })
})

app.get('/', (req, res) => {
    res.status(200).send('OK')
})

app.listen(port, () => {
    console.log(`server on ${port}`)
})