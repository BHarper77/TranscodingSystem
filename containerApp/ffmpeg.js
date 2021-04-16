const amqp = require("amqplib/callback_api");
const ffmpeg = require("fluent-ffmpeg");

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

        console.log(`Waiting for messages in ${queue}`);

        //FIXME: Container can't find video (ffmpeg exits with no dir found error)
        channel.consume(queue, (msg) => {
            console.log("Message received: " + msg.content.toString());
            user = JSON.parse(msg.content.toString());

            transcode(user);
        }, {
            noAck: true
        });
    });
});

function transcode(user)
{
    const dir = "/videos/";
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
        })
        .save(dir + "finished/" + `${user.username}.${user.userChoice.format}`);
}

async function delay(ms) 
{
    return new Promise(resolve => setTimeout(resolve, ms));
}