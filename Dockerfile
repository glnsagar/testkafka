FROM node:11-alpine
WORKDIR /usr/local/app
COPY *.js ./
RUN npm install kafka-node --no-optional --save
CMD [ "node", "KafkaService.js" ]
