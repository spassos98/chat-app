import { IncomingMessage, ServerResponse, createServer } from "http";
import { WebSocket } from "ws";
import {
  getMessages,
  getNumMessages,
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
  if (url == "/message") {
    if (req.method == "POST") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      res.write(JSON.stringify({ body: "hola body" }));
      const messageObj = JSON.parse(reqMessage.body);
      console.log("Adding message to db");
      const id = getNumMessages() + 1;
      insertMessage({
        id: id,
        message: messageObj.message,
        timestamp: new Date().toISOString(),
        user: messageObj.user
      });
      console.log("Sending update message to WS");
      wss.clients.forEach((client) => {
        client.send("update-chat");
      });
      res.end();
    } else if (req.method == "GET") {
      console.log("Retrieving chat status");
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      });
      const messages = getMessages();
      res.write(JSON.stringify({ chat: messages }));
      res.end();
    }
  } else if (url == "/about") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("<h2>About us</h2>");
    res.end();
  } else if (url == "/payment") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("<h1>Big money wow</h1>");
    res.end();
  } else if (url == "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.write("<h1>Hello world!</h1>");
    res.end();
  } else if (url == "/json") {
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    });
    res.write(JSON.stringify({ body: "hola body" }));
    res.end();
  } else {
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

const wss = new WebSocket.Server({ port: 8080 });

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
