const WebSocket = require("ws")
const wss = new WebSocket.Server({ port: 8080 })
const players = {}

wss.on("connection", function connection(ws) {
  const id = Math.random().toString(36).substring(2, 9)
  players[id] = { ws, data: {} }

  ws.on("message", function incoming(message) {
    try {
      const data = JSON.parse(message)
      players[id].data = data
    } catch (e) {}

    const others = {}
    for (const [pid, obj] of Object.entries(players)) {
      if (pid !== id && obj.data) {
        others[pid] = obj.data
      }
    }

    ws.send(JSON.stringify({ type: "sync", players: others }))
  })

  ws.on("close", () => {
    delete players[id]
  })
})
