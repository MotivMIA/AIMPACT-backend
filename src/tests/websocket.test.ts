import { WebSocket, WebSocketServer } from "ws";
import { createServer, Server } from "http";
import app from "../app";
import { setupWebSocket } from "../websocket";

describe("WebSocket", () => {
  let server: Server;
  let wss: WebSocketServer;

  beforeAll((done) => {
    server = createServer(app);
    wss = setupWebSocket(server);
    server.listen(0, () => done());
  });

  afterAll((done) => {
    wss.close();
    server.close(done);
  });

  it("should connect and receive a welcome message", (done) => {
    const ws = new WebSocket(`ws://localhost:${server.address()!.port}`);
    ws.on("open", () => {
      ws.on("message", (data) => {
        expect(JSON.parse(data.toString())).toEqual({ message: "Connected to WebSocket" });
        ws.close();
        done();
      });
      ws.on("error", (err) => {
        done(err);
      });
    });
    ws.on("error", (err) => {
      done(err);
    });
  });
});
