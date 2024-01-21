import { IncomingMessage, ServerResponse, createServer } from "http";
import { WebSocket } from "ws";
import {
  getMessages,
  getMessagesForRoom,
  getNumMessages,
  getRooms,
  initDatabase,
  insertMessage,
} from "./database";

const DB_FILE = "./database/ladata.db";
initDatabase(DB_FILE);
const hostname = "127.0.0.1";
const port = 3000;

interface RequestMessage {
  req: IncomingMessage;
  body: string;
}

function processRequest(
  reqMessage: RequestMessage,
  res: ServerResponse<IncomingMessage> & { req: IncomingMessage },
) {
  const req = reqMessage.req;
  const url = req.url;
  if (req.method == "OPTIONS") {
    res.writeHead(200, {
      "Access-Control-Allow-Origin": "*",
      Allow: "OPTIONS, GET, HEAD, POST",
      "access-control-allow-headers": "*",
    });
    res.end();
  }

  const urlPaths = url?.split("/").slice(1);
  if (urlPaths == undefined) {
    res.statusCode = 404;
    res.end("Not found");
    return;
  }
  if (urlPaths[0] === 'message') {
    console.log("In message")
    if (req.method == "POST") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(JSON.stringify({ body: "hola body" }));
      const messageObj = JSON.parse(reqMessage.body);
      console.log({ messageObj });
      console.log("Adding message to db");
      const id = getNumMessages() + 1;
      insertMessage({
        id: id,
        message: messageObj.message,
        timestamp: new Date().toISOString(),
        user: messageObj.user,
        roomid: messageObj.roomId,
      });
      console.log("Sending update message to WS");
      wss.clients.forEach((client) => {
        client.send("update-chat");
      });
      res.end();
    } else if (req.method == "GET" && urlPaths[1] !== undefined) {
      console.log("Retrieving chat status", urlPaths[1]);
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      const messages = getMessagesForRoom(Number(urlPaths[1]));
      res.write(JSON.stringify({ chat: messages }));
      res.end();
    }
  }
  else if (url == '/room') {
    if (req.method == "GET") {
      console.log("Retrieving room information");
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      const roomInfo = getRooms();
      res.write(JSON.stringify({ rooms: roomInfo }));
      res.end();
    }
  }
  else {
    res.statusCode = 404;
    res.end("Not found");
  }
}

const server = createServer((req, res) => {
  const chunks: Uint8Array[] = [];
  req.on("data", (chunk) => chunks.push(chunk));
  req.on("end", () => {
    const data = Buffer.concat(chunks);
    processRequest({ req: req, body: data.toString() ?? "hola" }, res);
  });
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});

const wss = new WebSocket.Server({ port: 8080, path: "/ws" });

console.log("Creating web socket server");
wss.on("connection", (ws: WebSocket) => {
  console.log("New client connected");

  ws.on("message", (message: string) => {
    console.log(`Received message: ${message}`);
    ws.send(`Server received your message: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});
