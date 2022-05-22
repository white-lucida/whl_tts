FROM jrottenberg/ffmpeg:4.1-ubuntu AS package_install

FROM node:17 AS npm_install
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json", "/usr/src/app/"]
RUN npm install

FROM node:17

# アプリケーションディレクトリを作成する
WORKDIR /usr/src/app

# アプリケーションのソースをバンドルする
COPY --from=package_install /usr/local/ /usr/local/
COPY --from=npm_install /usr/src/app/ /usr/src/app/
ENV LD_LIBRARY_PATH=/usr/local/lib
COPY . .
RUN npm run tsc

EXPOSE 8080
CMD [ "node", "index.js" ]