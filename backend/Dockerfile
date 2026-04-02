FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN mkdir -p uploads/doctors
EXPOSE 5000
CMD ["node", "src/app.js"]