FROM node:8

WORKDIR /usr/src/app

COPY package.json .

RUN npm install --silent

COPY . .

RUN npm run build

EXPOSE 3001

USER node

CMD [ "npm", "start" ]
