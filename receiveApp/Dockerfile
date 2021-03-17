FROM rabbitmq

#install Python
RUN apt-get update &&\
    apt-get install -y \
    python3-pip

#Install Pika
RUN python3 -m pip install pika

#Create new user
RUN useradd -ms /bin/bash user
USER user
WORKDIR /home/user

RUN mkdir videos

COPY . .

CMD ["python3", "ffmpeg.py"]

EXPOSE 5672