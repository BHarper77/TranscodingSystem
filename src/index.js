const express = require("express");
const app = express();

const http = require("http").Server(app);
const io = require("socket.io")(http);

const bodyParser = require("body-parser");
const multer = require("multer");

const firebaseAdmin = require("firebase-admin");
const serviceAccount = require("../honours-project-88f0c-firebase-adminsdk-pjyfq-be29971c7a.json");

const amqp = require("amqplib/callback_api");
const { json } = require("body-parser");

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
        cb(null, filePath)
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

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/upload.js", (req, res) => {
    res.sendFile(__dirname + "/upload.js");
});

app.post("/save-file", upload.single("file"), (req, res) => {
    //Creates endpoint 'save-file' for POST requests to be sent to
    res.end();
});

io.on("connection", (socket) => {
    console.log("a user connected");
});

const port = 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));