from node:20-alpine as BUILD

WORKDIR /app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build


from node:20-alpine as DIST

WORKDIR /app
ENV NODE_ENV=production
COPY --from=BUILD /app/package*.json .
RUN npm ci
COPY --from=BUILD /app/dist ./dist
COPY --from=BUILD /app/config ./config

USER node

cmd [ "node", "./dist/main.js" ]
