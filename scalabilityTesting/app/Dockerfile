FROM node

#Create new user
WORKDIR /home/user

#Install npm packages
RUN npm install amqplib

COPY . .

CMD ["node", "app.js"]

EXPOSE 5672