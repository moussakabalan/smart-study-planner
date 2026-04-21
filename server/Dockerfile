FROM node:20-bookworm-slim

WORKDIR /app

COPY server/package*.json ./server/
RUN cd server && npm install --omit=dev

COPY server/src ./server/src
COPY database ./database

EXPOSE 3001

CMD ["node", "server/src/index.js"]