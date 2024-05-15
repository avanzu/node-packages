from node:20-alpine

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

USER node

cmd [ "npm", "run", "start" ]
