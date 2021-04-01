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

const amqp = require("amqplib/callback_api");
const { json } = require("body-parser");

const chokidar = require("chokidar");

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

//Initialize Firebase SDK
firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount)
});

const db = firebaseAdmin.firestore();
const filePath = "files";

//Insert data into Firestore
async function testFirestore(db, file, name)
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

//Tell Multer where to store file and what to call file
const storage = multer.diskStorage({
    destination: function (req, file, cb)
    {
        cb(null, "../" + filePath)
    },
    filename: function (req, file, cb)
    {
        //var x = randNum();
        const fileType = file.mimetype.split("/");
        var name = `${req.body.name}.${fileType[1]}`;

        cb(null, name);

        //testFirestore(db, file, name);
        send(name);
    }
});

const upload = multer({storage});
upload.any();

app.post("/save-file", upload.single("file"), (req, res) => {
    //Creates endpoint 'save-file' for POST requests to be sent to
    console.log("File received: " + req.body.name);
    res.end();
});

//Testing
app.post("/test", (req, res) => {
    res.end();
});

//Initialise socket with username from client side
io.use((socket, next) => {
    const username = socket.handshake.auth.username;

    if (!username)
    {
        return next(new Error("invalid username"));
    }

    socket.username = username;
    next();
});

const users = [];

io.on("connection", (socket) => {
    //Push new user to user list
    users.push({
        username: socket.username,
        socketId: socket.id
    });

    users.forEach(element => {
        console.log(element);
    });

    console.log("\nA user connected: " + socket.username);
    console.log("SocketID: " + socket.id);

    socket.on("userChoice", (content) => {
        console.log("userChoice: " + content.test);
    });

    socket.on("disconnect", () => {
        //Delete user from user list on disconnect
        console.log("User disconnected: " + socket.username);
        users.splice(users.findIndex(v => v.username === socket.username), 1);
    });

    fileWatching();
});

//TODO: Delete files in files dir when same file is in finished dir
async function fileWatching()
{
    var fileLocation = ("../files/finished");

    var watcher = chokidar.watch(".", {
        persistent: false,
        cwd: fileLocation
    });

    watcher.on("add", path => {
        console.log("New file detected: " + path);

        const split = path.split(".");

        //Search for matching username to send file to 
        users.every((element, index) => {
            if (element.username === split[0])
            {
                //socket.to(element.socketId).emit("fileReady", split[0]);
                io.to(element.socketId).emit("fileReady", split[0]);
                return false;
            }
            else //Can't find currently connected user to deliver file to 
            {
                console.log("User match not found");
            }

            return true;
        });
    });
}

const port = 3000;
httpServer.listen(port, () => console.log(`Server is running on port ${port}`));