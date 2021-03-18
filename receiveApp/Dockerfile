FROM node

#Create new user
RUN useradd -ms /bin/bash user
USER user
WORKDIR /home/user

#Install packages
RUN npm install amqplib

RUN mkdir videos

COPY . .

CMD ["node", "receive.js"]

EXPOSE 5672