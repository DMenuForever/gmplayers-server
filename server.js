const express = require('express')
const app = express()
const port = 8080
const players = {}

app.use(express.json())

app.post('/sync', (req, res) => {
  const data = req.body
  const id = data.id
  if (!id) return res.status(400).send('ID не указан')

  // Сохраняем данные игрока
  players[id] = { data }

  // Отправляем всем игрокам информацию о других игроках
  const others = {}
  for (const [pid, obj] of Object.entries(players)) {
    if (pid !== id && obj.data) {
      others[pid] = obj.data
    }
  }

  res.json({ players: others })
})

app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`)
})
