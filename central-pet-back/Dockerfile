FROM node:20.11.0 AS build

WORKDIR /app

COPY ./dist/ ./dist/

COPY package.json package-lock.json .env ./

RUN npm install

CMD ["npm", "start"]
