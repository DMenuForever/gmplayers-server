const express = require('express')
const app = express()
const port = 8080

app.use(express.json())

const players = {}

app.post('/sync', (req, res) => {
    const { id, pos, ang, weapon, map, message } = req.body

    if (!id) return res.status(400).json({ error: 'No ID provided' })

    players[id] = { pos, ang, weapon, map }

    const others = {}
    for (const [pid, pdata] of Object.entries(players)) {
        if (pid !== id) others[pid] = pdata
    }

    res.json({ players: others })
})

app.get('/status', (req, res) => {
    const list = Object.entries(players).map(([id, data]) => ({
        id,
        map: data.map || 'unknown'
    }))
    res.json({ online: list })
})

app.listen(port, () => {
    console.log(`Server on ${port}`)
})
