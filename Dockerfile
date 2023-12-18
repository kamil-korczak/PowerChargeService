FROM node:21.4.0

WORKDIR /app

COPY package*.json .
COPY tsconfig.json .
COPY jest.config.js .

RUN npm ci

COPY ./source /app/source

# Run tests
RUN npm run test

# Run build
RUN npm run build

EXPOSE 8000

CMD ["node", "build/app.js"]
