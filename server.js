const express = require('express')
const app = express()
const port = 8080

app.use(express.json())

const players = {}

app.post('/sync', (req, res) => {
    const { id, pos, ang, weapon, map, message } = req.body
    if (!id) return res.status(400).json({ error: 'no id' })

    players[id] = {
        pos: pos || { x: 0, y: 0, z: 0 },
        ang: ang || { p: 0, y: 0, r: 0 },
        weapon: weapon || 'none',
        map: map || 'unknown',
        message: message || ''
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
        map: data.map
    }))
    res.json({ online })
})

app.listen(port, () => {
    console.log(`server on ${port}`)
})
