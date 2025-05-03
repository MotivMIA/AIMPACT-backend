import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";

export const setupWebSocket = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => {
      console.log("Received:", message.toString());
    });
    ws.send(JSON.stringify({ message: "Connected to WebSocket" }));
  });

  return wss;
};

export const broadcastTransactionUpdate = (wss: WebSocketServer, transaction: any) => {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: "transactionUpdate", transaction }));
    }
  });
};
