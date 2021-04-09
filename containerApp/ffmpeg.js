const amqp = require("amqplib/callback_api");
const ffmpeg = require("fluent-ffmpeg");

const cluster = "amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861"

amqp.connect(cluster, (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        const queue = "files";

        channel.assertQueue(queue, {
            durable: false
        });

        console.log(`Waiting for messages in ${queue}`);

        //Receive one message from queue and exit
        //FIXME: Container not receiving or not consuming messages from queue
        channel.consume(queue, (msg) => {
            console.log("Message received: " + msg.content);

            user = JSON.parse(msg.content);

            channel.close();
            connection.close();

            transcode(user);
        }, {
            noAck: true
        });
    });
});

//Get filename from message queue and transcode
//TODO: Container not exiting immediately after transcoding is done (hangs too long)
//      No progress is being displayed
//      Might be better when doing proper tasks
async function transcode(user)
{
    const dir = "../files/";
    const file = dir + user.fullFileName;

    //TODO: Try to improve speed of transcoding, currently slow
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
            console.log(`${err} \n ${stdout} \n ${stderr}`);
        })
        .on("end", () => {
            console.log(`${file} has finished transcoding`);
        })
        .save(dir + "finished/" + `${user.username}.${user.userChoice.format}`);
}