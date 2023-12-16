FROM node:21.4.0

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json .

RUN npm ci

COPY ./source /app/source

RUN npm run build

EXPOSE 8000

CMD ["node", "build/app.js"]
