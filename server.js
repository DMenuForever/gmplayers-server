const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: 8080 })

let players = {}

wss.on('connection', function connection(ws) {
  let id = Math.random().toString(36).substr(2, 9)
  players[id] = { ws, data: {} }

  ws.on('message', function incoming(message) {
    const data = JSON.parse(message)
    players[id].data = data

    let others = Object.keys(players)
      .filter(pid => pid !== id)
      .map(pid => players[pid].data)

    ws.send(JSON.stringify({ type: 'players', others }))
  })

  ws.on('close', () => {
    delete players[id]
  })
})
