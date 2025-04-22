const express = require('express');
const app = express();
const port = 3000;

let players = {};

app.use(express.json());

app.post('/sync', (req, res) => {
    const { id, pos, ang, weapon, message } = req.body;

    if (id) {
        players[id] = {
            pos,
            ang,
            weapon,
            message
        };
    }

    const otherPlayers = {};
    for (const [pid, data] of Object.entries(players)) {
        if (pid !== id) {
            otherPlayers[pid] = data;
        }
    }

    res.json({ type: 'sync', players: otherPlayers });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});