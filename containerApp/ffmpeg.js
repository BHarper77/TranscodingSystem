const amqp = require("amqplib/callback_api");
const ffmpeg = require("fluent-ffmpeg"); 
const mv = require("mv");

const cluster = "amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861"
const clusterFFmpeg = "amqp://ffmpeg:ffmpeg@192.168.49.2:30861"

let amqpChannel = null;
let queue = "files";

amqp.connect(clusterFFmpeg, (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        channel.prefetch(1);
        amqpChannel = channel;
        console.log("Channel created");
    });
});

let readMessage = () => {
    if (amqpChannel)
    {
        console.log("Looking for messages");
        amqpChannel.get(queue, {noAck: false}, (err, msg) => {
            if (err) console.log(err);

            if (msg)
            {
                amqpChannel.ack(msg, false);
                console.log("Message received: " + msg.content.toString());
                transcode(JSON.parse(msg.content.toString()));
            }
            else
            {
                console.log("No message found");
                return;
            }
        });
    }
}

setTimeout(readMessage, 10000);

function transcode(user)
{
    const dir = "videos/";
    const file = dir + user.fullFileName;

    ffmpeg(file)
        .videoCodec(user.userChoice.encoder)
        .format(user.userChoice.format)
        .size(user.userChoice.resolution)
        .on("start", (commandLine) => {
            console.log("Transcoding started with command: " + commandLine);
        })
        .on("progress", (progress) => {
            console.log(`Processing ${progress.percent}% done`);
        })
        .on("error", (err, stdout, stderr) => {
            console.log(`${file} could not be transcoded`);
            console.log(`${err}`);
        })
        .on("end", () => {
            console.log(`${file} has finished transcoding`);
            let oldPath = dir + "transcoding/" + `${user.username}.${user.userChoice.format}`;
            let newPath = dir + "finished/" + `${user.username}.${user.userChoice.format}`;

            mv(oldPath, newPath, (err) => {
                if (err) throw err;
                console.log(`File ${user.fullFileName} moved to /finished`);
            });
        })
        .save(dir + "transcoding/" + `${user.username}.${user.userChoice.format}`);
}