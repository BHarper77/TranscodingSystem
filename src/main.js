const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/upload.js", (req, res) => {
    res.sendFile(__dirname + "/upload.js");
});

const port = 8080;
http.listen(port, () => console.log(`Server is running on port ${port}`));