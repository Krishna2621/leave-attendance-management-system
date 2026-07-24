FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

USER node

EXPOSE 5000

CMD ["npm", "start"]