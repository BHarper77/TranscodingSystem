const express = require("express");
const app = express();

const corsLocal = "http://192.168.254.138:8080";
const cors = "http://192.168.43.125:8080";
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
    cors: { origin: corsLocal }
});

const bodyParser = require("body-parser");
const multer = require("multer");

const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("../honours-project-88f0c-firebase-adminsdk-pjyfq-be29971c7a.json");

const { json } = require("body-parser");

const amqp = require("amqplib/callback_api");
const chokidar = require("chokidar");
const path = require("path");

//Send message to RabbitMQ
function send(name)
{
    const localHost = "amqp://127.0.0.1:5672";
    const cluster = "amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861";

    amqp.connect(cluster, function(error0, connection) {
        if (error0) throw error0;

        connection.createChannel(function(error1, channel) {
            if (error1) throw error1;

            const queue = "files";
            var msg = name;

            channel.assertQueue(queue, {
                durable: false
            });

            channel.sendToQueue(queue, Buffer.from(msg));
            console.log("Message sent:" + msg);
        });
    });
}

//#region FIRESTORE
//Initialize Firebase SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});

const db = firebaseAdmin.firestore();
const filePath = "files";

//Insert data into Firestore
async function firestore(db, file, name)
{
    var currentdate = new Date(); 
    var datetime = currentdate.getDate() + "/"
        + (currentdate.getMonth()+1)  + "/" 
        + currentdate.getFullYear() + " - "  
        + currentdate.getHours() + ":"  
        + currentdate.getMinutes() + ":" 
        + currentdate.getSeconds();

    const docRef = db.collection('videos').doc(name);

    await docRef.set({
        name: name,
        originalName: file.originalname,
        path: `${filePath}/${name}`,
        dateTime: datetime
    });
}

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
//#endregion

//#region MULTER
//Tell Multer where to store file and what to call file
const storage = multer.diskStorage({
    destination: function (req, file, cb)
    {
        cb(null, "../" + filePath)
    },
    filename: function (req, file, cb)
    {
        const fileType = file.mimetype.split("/");
        var name = `${req.body.name}.${fileType[1]}`;

        cb(null, name);

        //firestore(db, file, name);
        //send(name);
    }
});

const upload = multer({storage});
upload.any();
//#endregion

//#region ENDPOINTS
app.post("/save-file", upload.single("file"), (req, res) => {
    console.log("File received: " + req.body.name);
});

app.get("/get-file/:filename", (req, res) => {
    const { filename } = req.params;
    const split = filename.split(".");

    if (!filename) { res.status(410).send("Attach filename"); }

    //Search for user match
    users.every((element) => {
        if (element.username === split[0])
        {
            res.sendFile(path.join(__dirname, "../files/finished/") + element.fullFileName);
            //TODO: Delete file when client has downloaded it
            return false;
        }
        else //Can't find user to deliver file to 
        {
            res.status(510).send("File not found");
        }

        return true;
    });
});

//Testing
app.post("/test", (req, res) => {
    res.end();
});
//#endregion

//#region SOCKETS
const users = [];

//Initialise socket with username from client side
io.use((socket, next) => {
    const username = socket.handshake.auth.username;
    const filetype = socket.handshake.auth.filetype;
    const userChoice = socket.handshake.auth.userChoice;

    if (!username || !filetype || !userChoice)
    {
        return next(new Error("Missing parameter from socket object"));
    }

    socket.username = username;
    socket.filetype = filetype;
    socket.userChoice = userChoice;
    next();
});

io.on("connection", (socket) => {
    //Push new user to user list
    users.push({
        username: socket.username,
        socketId: socket.id,
        fullFileName: `${socket.username}.${socket.filetype}`
    });

    console.log("\nA user connected: " + socket.username);

    socket.on("userChoice", (content) => {
        console.log("userChoice: " + content.test);
    });

    socket.on("disconnect", () => {
        //Delete user from user list on disconnect
        users.splice(users.findIndex(v => v.username === socket.username), 1);
    });

    fileWatching();
});
//#endregion

//TODO: Delete files in files dir when same file is in finished dir
async function fileWatching()
{
    var fileLocation = ("../files/finished");

    var watcher = chokidar.watch(".", {
        persistent: false,
        cwd: fileLocation
    });

    //FIXME: Event triggering multiple times for each file
    watcher.on("add", path => {
        console.log("New file detected: " + path);

        const split = path.split(".");

        //Search for matching username to send file to 
        users.every((element) => {
            if (element.username === split[0])
            {
                io.to(element.socketId).emit("fileReady", split[0]);
                return false;
            }
            else //Can't find user to deliver file to 
            {
                console.log("fileWatching: User match not found");
            }

            return true;
        });
    });
}

const port = 3000;
httpServer.listen(port, () => console.log(`Server is running on: http://localhost:${port}/`));