import pika, sys, os

def main():
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='amqp://EmZn4ScuOPLEU1CGIsFKOaQSCQdjhzca:dJhLl2aVF78Gn07g2yGoRuwjXSc6tT11@192.168.49.2:30861'))
    channel = connection.channel()

    channel.queue_declare(queue='files')

    def callback(ch, method, properties, body):
        print("---------------------[x] Recieved %r" % body)

    channel.basic_consume(queue='files', on_message_callback=callback, auto_ack=True)

    print("------------------[*] Waiting for messages------------------")
    channel.start_consuming()

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print('Interrupted')
        try:
            sys.exit(0)
        except SystemExit:
            os._exit(0)