FROM node

#Install FFmpeg
RUN apt-get update &&\
    yes | apt-get install ffmpeg

#Create new user
#RUN useradd -ms /bin/bash user
#USER user
WORKDIR /home/user

#Install npm packages
RUN npm install amqplib fluent-ffmpeg

#RUN mkdir videos
#RUN chmod -R 777 videos

COPY . .

CMD ["node", "ffmpeg.js"]

EXPOSE 5672