FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 4000
EXPOSE 3306

CMD ["npm", "run", "dev"]