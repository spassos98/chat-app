"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const ws_1 = require("ws");
const database_1 = require("./database");
const DB_FILE = "./database/ladata.db";
(0, database_1.initDatabase)(DB_FILE);
const hostname = "127.0.0.1";
const port = 3000;
function processRequest(reqMessage, res) {
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
    const urlPaths = url === null || url === void 0 ? void 0 : url.split("/").slice(1);
    if (urlPaths == undefined) {
        res.statusCode = 404;
        res.end("Not found");
        return;
    }
    if (urlPaths[0] === 'message') {
        console.log("In message");
        if (req.method == "POST") {
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            });
            res.write(JSON.stringify({ body: "hola body" }));
            const messageObj = JSON.parse(reqMessage.body);
            console.log({ messageObj });
            console.log("Adding message to db");
            const id = (0, database_1.getNumMessages)() + 1;
            (0, database_1.insertMessage)({
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
        }
        else if (req.method == "GET" && urlPaths[1] !== undefined) {
            console.log("Retrieving chat status", urlPaths[1]);
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            });
            const messages = (0, database_1.getMessagesForRoom)(Number(urlPaths[1]));
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
            const roomInfo = (0, database_1.getRooms)();
            res.write(JSON.stringify({ rooms: roomInfo }));
            res.end();
        }
    }
    else {
        res.statusCode = 404;
        res.end("Not found");
    }
}
const server = (0, http_1.createServer)((req, res) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
        var _a;
        const data = Buffer.concat(chunks);
        processRequest({ req: req, body: (_a = data.toString()) !== null && _a !== void 0 ? _a : "hola" }, res);
    });
});
server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
const wss = new ws_1.WebSocket.Server({ port: 8080, path: "/ws" });
console.log("Creating web socket server");
wss.on("connection", (ws) => {
    console.log("New client connected");
    ws.on("message", (message) => {
        console.log(`Received message: ${message}`);
        ws.send(`Server received your message: ${message}`);
    });
    ws.on("close", () => {
        console.log("Client disconnected");
    });
});
