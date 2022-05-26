FROM node:16.15-alpine3.14
COPY package*.json ./
COPY . .
EXPOSE 8080
RUN npm install
CMD [ "node", "server.js" ]