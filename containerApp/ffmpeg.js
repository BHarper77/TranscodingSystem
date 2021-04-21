const amqp = require("amqplib/callback_api");
const ffmpeg = require("fluent-ffmpeg"); 
const mv = require("mv");

const cluster = "amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861"
const clusterFFmpeg = "amqp://ffmpeg:ffmpeg@192.168.49.2:30861"

amqp.connect(clusterFFmpeg, (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        const queue = "files";

        channel.assertQueue(queue, {
            durable: false
        });

        channel.prefetch(1);

        console.log(`Waiting for messages in ${queue}`);

        channel.consume(queue, (msg) => {
            console.log("Message received: " + msg.content.toString());
            user = JSON.parse(msg.content.toString());
            channel.ack(msg);

            transcode(user);
        }, {
            noAck: false
        });
    });
});

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