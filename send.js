const amqp = require('amqplib/callback_api');

const localHost = "amqp://127.0.0.1:5672";
const cluster = "amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861"; //for amqp

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
        var msg = {
            name: "Hello World"
        };

        var msgJson = JSON.stringify(msg);

        channel.assertQueue(queue, {
            durable: false
        });

        channel.sendToQueue(queue, Buffer.from(msgJson));
    });
});