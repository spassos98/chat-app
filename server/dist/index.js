"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const hostname = "127.0.0.1";
const port = 3000;
const chat = [];
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
    if (url == "/message") {
        if (req.method == "POST") {
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            });
            res.write(JSON.stringify({ body: "hola body" }));
            const messageObj = JSON.parse(reqMessage.body);
            chat.push(messageObj.message);
            console.log("adding message to chat");
            res.end();
        }
        else if (req.method == "GET") {
            console.log("Retrieving chat status");
            res.writeHead(200, {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
            });
            res.write(JSON.stringify({ message: chat }));
            res.end();
        }
    }
    else if (url == "/about") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write("<h2>About us</h2>");
        res.end();
    }
    else if (url == "/payment") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write("<h1>Big money wow</h1>");
        res.end();
    }
    else if (url == "/") {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write("<h1>Hello world!</h1>");
        res.end();
    }
    else if (url == "/json") {
        res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
        });
        res.write(JSON.stringify({ body: "hola body" }));
        res.end();
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
