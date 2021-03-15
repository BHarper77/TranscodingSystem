const express = require("express");
const app = express();

const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
    cors: { origin: "http://localhost:8080" }
});

const bodyParser = require("body-parser");
const multer = require("multer");

const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("../honours-project-88f0c-firebase-adminsdk-pjyfq-be29971c7a.json");

const amqp = require("amqplib/callback_api");
const { json } = require("body-parser");

const chokidar = require("chokidar");

//Send message to RabbitMQ
function send(file, name)
{
    const localHost = "amqp://127.0.0.1:5672";
    const cluster = "amqp://192.168.49.2:30861";

    amqp.connect(localHost, function(error0, connection) 
    {
        if (error0)
        {
            throw error0;
        }

        connection.createChannel(function(error1, channel) 
        {
            if (error1)
            {
                throw error1;
            }

            const queue = "files";
            var msg = {
                name: name
            };

            var msgJson = JSON.stringify(msg);

            channel.assertQueue(queue, {
                durable: false
            });

            channel.sendToQueue(queue, Buffer.from(msgJson));
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

        testFirestore(db, file, name);
        send(file, name);
    }
});

const upload = multer({storage});
upload.any();

app.post("/save-file", upload.single("file"), (req, res) => {
    //Creates endpoint 'save-file' for POST requests to be sent to
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

io.on("connection", (socket) => {
    console.log("A user connected: " + socket.username);
    console.log("SocketID: " + socket.id);

    socket.on("userChoice", (content) => {
        console.log("userChoice: " + content.test);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });

    //fileWatching(socket);
});

//TODO: Send socket message to user when video is finished transcoding
//Send message to specific user when video is transcoded. Current implementation is broadcasting every video to user
//Need to think of way of tying socket.id and username/filename together for each user. Store in DB maybe?
async function fileWatching(socket)
{
    var fileLocation = ("../files");

    var watcher = chokidar.watch(".", {
        persistent: false,
        cwd: fileLocation
    });

    watcher.on("add", path => {
        const split = path.split(".");

        //socket.emit("fileReady", split[0]);
        socket.to(socket.id).emit("fileReady", split[0]);
    });
}

const port = 3000;
httpServer.listen(port, () => console.log(`Server is running on port ${port}`));