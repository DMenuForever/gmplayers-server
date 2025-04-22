const express = require('express');
const app = express();
const port = 8080;

let players = {};

app.use(express.json());

app.post('/sync', (req, res) => {
    const { id, pos, ang, weapon, message, map } = req.body;

    if (id) {
        players[id] = {
            pos,
            ang,
            weapon,
            message,
            map
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

app.get('/status', (req, res) => {
    let statusHTML = '<h1>Онлайн Игроки</h1><ul>';
    for (const [id, data] of Object.entries(players)) {
        statusHTML += `<li>${id} - Карта: ${data.map}</li>`;
    }
    statusHTML += '</ul>';
    res.send(statusHTML);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
