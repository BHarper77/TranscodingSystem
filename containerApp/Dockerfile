FROM openjdk:11

WORKDIR /app

#Install FFmpeg
RUN apt-get update &&\
    yes | apt-get install ffmpeg

#Create new user
RUN useradd -ms /bin/bash user
USER user
WORKDIR /home/user

RUN mkdir videos

COPY . .

RUN javac ffmpegCommand.java

CMD ["java", "ffmpegCommand"]