const amqp = require("amqplib/callback_api");

const cluster = "amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861"

let amqpChannel = null;
let queue = "scaleTest";

amqp.connect(cluster, (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        channel.prefetch(1);
        amqpChannel = channel;
        console.log("Channel created");
    });
});

function readMessage() 
{
    if (amqpChannel)
    {
        console.log("Looking for messages");
        amqpChannel.get(queue, {noAck: false}, (err, msg) => {
            if (err) console.log(err);

            if (msg)
            {
                amqpChannel.ack(msg, false);
                console.log("Message received: " + msg.content.toString());
                return;
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

function sleep(ms) 
{
    console.log("Sleeping for: " + ms);
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}