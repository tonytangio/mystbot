FROM node:latest

WORKDIR /mystbot
COPY package.json .
RUN npm install
COPY . .

CMD ["npm", "run", "watch"]