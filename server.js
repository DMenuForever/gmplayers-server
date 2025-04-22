const express = require('express')
const app = express()
const port = 8080

app.use(express.json())

const players = {}
const TIMEOUT = 20 * 1000

setInterval(() => {
    const currentTime = Date.now()
    for (const id in players) {
        const player = players[id]
        if (currentTime - player.lastUpdate > TIMEOUT) {
            console.log(`Player ${id} timed out and is being removed`)
            delete players[id]
        }
    }
}, 5000)

app.post('/sync', (req, res) => {
    const { id, pos, ang, weapon, map, state, steamid, nickname } = req.body
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

    const others = {}
    for (const [pid, data] of Object.entries(players)) {
        if (pid !== id) others[pid] = data
    }

    res.json({ players: others })
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