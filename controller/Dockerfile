FROM node:17
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json", "/usr/src/app/"]
RUN npm install
COPY . .
RUN npm run tsc

EXPOSE 8080
CMD ["node", "index.js"]