const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("../src/"));

const port = 8080;
http.listen(port, () => console.log(`Server is running on: http://localhost:${port}/`));