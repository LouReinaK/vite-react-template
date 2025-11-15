export class Room {
  constructor(state, env) {
    this.state = state;
    this.env = env;

    // liste des websockets connectés
    this.sockets = [];
  }

  async fetch(request) {
    // upgrade en websocket
    const [client, server] = Object.values(new WebSocketPair());

    server.accept();

    this.sockets.push(server);

    server.addEventListener("message", evt => {
      const message = evt.data;

      // Broadcast aux autres sockets
      for (const ws of this.sockets) {
        if (ws !== server) {
          ws.send(message);
        }
      }
    });

    server.addEventListener("close", () => {
      this.sockets = this.sockets.filter(ws => ws !== server);
    });

    return new Response(null, {
      status: 101,
      webSocket: client
    });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const roomId = url.pathname.split("/")[2];

    const id = env.ROOM.idFromName(roomId);
    const roomObj = env.ROOM.get(id);

    return roomObj.fetch(request);
  }
};
