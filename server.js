const express = require('express')
const app = express()
const port = 8080

app.use(express.json())

const players = {}
const props = {}
const chatMessages = []
const TIMEOUT = 6000
const MAX_CHAT_MESSAGES = 50
const MAX_PROPS = 1000

let propIdCounter = 0
function generatePropId() {
    return `prop_${propIdCounter++}_${Date.now()}`
}

setInterval(() => {
    const now = Date.now()
    for (const id in players) {
        if (now - players[id].lastUpdate > TIMEOUT) {
            console.log(`Player ${id} timed out`)
            delete players[id]
        }
    }
    for (const propId in props) {
        if (now - props[propId].lastUpdate > TIMEOUT) {
            delete props[propId]
        }
    }
}, 5000)

app.post('/sync', (req, res) => {
    const { id, pos, ang, weapon, map, state, steamid, nickname, props: clientProps, health } = req.body
    if (!id) return res.status(400).json({ error: 'Missing ID' })

    // Обновляем только своего игрока
    if (!players[id]) {
        players[id] = { lastUpdate: Date.now() }
    }
    players[id] = {
        pos: id === req.body.id ? pos : players[id].pos, // Только собственная позиция
        ang: id === req.body.id ? ang : players[id].ang, // Только собственный угол
        weapon, map, state, steamid, nickname,
        health: health !== undefined ? health : (players[id]?.health || 100),
        lastUpdate: Date.now()
    }

    if (clientProps) {
        for (const prop of clientProps) {
            const propId = prop.id || generatePropId()
            if (!props[propId] && Object.keys(props).length >= MAX_PROPS) continue
            props[propId] = {
                model: prop.model,
                pos: prop.pos,
                ang: prop.ang,
                velocity: prop.velocity || { x: 0, y: 0, z: 0 },
                lastUpdate: Date.now(),
                ownerId: id // Отмечаем владельца для проверки спавна
            }
        }
    }

    const otherPlayers = {}
    for (const pid in players) {
        if (pid !== id) otherPlayers[pid] = players[pid]
    }

    res.json({ players: otherPlayers, props, chat: chatMessages })
})

app.post('/damage', (req, res) => {
    const { attackerId, victimId, damage } = req.body
    if (!attackerId || !victimId || damage === undefined) {
        return res.status(400).json({ error: 'Missing data' })
    }
    if (players[victimId]) {
        players[victimId].health = Math.max(0, players[victimId].health - damage)
        console.log(`Player ${victimId} took ${damage} damage from ${attackerId}. Health: ${players[victimId].health}`)
        res.json({ status: 'OK', health: players[victimId].health })
    } else {
        res.status(404).json({ error: 'Victim not found' })
    }
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
        id, nickname: p.nickname, steamid: p.steamid, map: p.map, health: p.health
    }))
    res.json({ online })
})

app.get('/', (req, res) => {
    res.send('OK')
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})