const amqp = require("amqplib/callback_api");
const ffmpeg = require("fluent-ffmpeg");

const cluster = "amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861"

amqp.connect(cluster, function(error0, connection) 
{
    if (error0) throw error0;

    connection.createChannel(function(error1, channel)
    {
        if (error1) throw error1;

        const queue = "files";

        channel.assertQueue(queue, {
            durable: false
        });

        console.log(`Waiting for messages in ${queue}`);

        //Receive one message from queue and exit
        channel.consume(queue, function(msg) {
            console.log("Message received: " + msg.content.toString());

            transcode(msg.content.toString());

            //TODO: Implement way of exiting the script when video is finished transcoding
        }, {
            noAck: true
        });
    });
});

//Get filename from message queue and transcode
function transcode(name)
{
    const dir = "videos/";
    const file = dir + name;
    const split = name.split(".");

    ffmpeg(file)
        //.format("mp4")
        .outputOptions("-codec copy")
        .on("start", function(commandLine) {
            console.log("Transcoding started with command: " + commandLine);
        })
        .on("error", function(err, stdout, stderr) {
            console.log(`${file} could not be transcoded`);
            console.log(`${err} \n ${stdout} \n ${stderr}`);
        })
        .on("end", function() {
            console.log(`${file} has finished transcoding`);
        })
        .save(dir + `${split[0]}.mp4`);
}