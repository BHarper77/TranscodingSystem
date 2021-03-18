const amqp = require("amqplib/callback_api");

const cluster = "amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861"

amqp.connect(cluster, function(error0, connection) 
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

        channel.assertQueue(queue, {
            durable: false
        });

        console.log(`Waiting for messages in ${queue}`);
        channel.consume(queue, function(msg)
        {
            var object = JSON.parse(msg.content.toString());
            console.log(`Message Recieved: ${object.name}`);
        }, {
            noAck: true
        });
    });
});