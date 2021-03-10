const express = require("express");
const app = express();

const http = require("http").Server(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/upload.js", (req, res) => {
    res.sendFile(__dirname + "/upload.js");
});

io.on("connection", (socket) => {
    console.log("a user connected");
});

const port = 3000;

app.listen(port, () => {
    console.log(`Server listening on port: ${port}`);
});