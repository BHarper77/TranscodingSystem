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

        //TODO: Channel.get method isn't working, only consume method
        //Receive one message from queue and exit
        /*channel.get(queue, msg => {
            if (msg)
            {
                var object = JSON.parse(msg.content.toString());
                console.log("Message received: " + object.name);
                transcode(object.name);

                channel.close();
            }

            
        });*/

        channel.consume(queue, function(msg) {
            console.log(" [x] Received %s", msg.content.toString());
        }, {
            noAck: true
        });
    });
});

//Get filename from message queue and transcode
function transcode(name)
{
    const dir = "files";
    const file = dir + "/name";

    ffmpeg(file)
        .on("error", function(err) {
            console.log(`${file} could not be transcoded. Error: ${err}`);
        })
        .on("progress", function(progress) {
            console.log(`Current progress: ${progress.percent} done`);
        })
        .on("end", function() {
            console.log(`${file} has finished transcoding`);
        })
        .save(dir + `/${name}.mp4`);
}