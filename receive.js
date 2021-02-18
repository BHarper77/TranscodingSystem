const amqp = require("amqplib/callback_api");

const localHost = "amqp://localhost:5672"

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