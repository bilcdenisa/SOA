FROM node:18-alpine

WORKDIR /app

COPY package.json .
RUN npm install --omit=dev

COPY . .

# CMD is intentionally omitted
# docker-compose will decide what to run
