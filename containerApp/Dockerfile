FROM node

#Install FFmpeg
RUN apt-get update &&\
    yes | apt-get install ffmpeg

#Create new user
WORKDIR /home/user

#Install npm packages
RUN npm install amqplib fluent-ffmpeg

COPY . .

CMD ["node", "ffmpeg.js"]

EXPOSE 5672