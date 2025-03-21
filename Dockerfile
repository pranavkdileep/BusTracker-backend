FROM node:20-slim

WORKDIR /app

COPY . /app

RUN npm install

RUN npm run build

CMD ["npm", "run", "start"]
