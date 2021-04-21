const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("../src/"));

/*app.get("get-file/:filename", (req, res) => {
    const { filename } = req.params;
    const split = filename.split(".");

    if (!filename) { res.status(410).send("Attach filename"); }

    res.sendFile(path.join(__dirname, "../files/finished/") + element.fullFileName);
});*/

const port = 8080;
http.listen(port, () => console.log(`Server is running on: http://localhost:${port}/`));