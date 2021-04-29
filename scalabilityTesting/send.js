var amqp = require('amqplib/callback_api');

const localHost = "amqp://127.0.0.1:5672";
const cluster = "amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861";

amqp.connect(cluster, (error0, connection) => {
    if (error0) throw error0;

    connection.createChannel((error1, channel) => {
        if (error1) throw error1;

        const queue = "scaleTest";

        channel.assertQueue(queue, {
            durable: true
        });

        for (i = 0; i < 3; i++)
        {
            let msg = "message " + i;
            channel.sendToQueue(queue, Buffer.from(msg));
            console.log("Message sent: message " + i);
        }
    });
    setTimeout(() => {
        connection.close();
        process.exit(0);
    }, 1000);
});