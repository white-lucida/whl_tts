# WHL-TTS

Implementation of whl-tts bot

# 構成

このリポジトリは以下の2つのパッケージを含んでいます。

- Client
- Controller

これらはコードベース上では互いに依存しておらず、Discordの管理用テキストチャンネル（以下ターミナル）上でメッセージを相互にやり取りすることではじめて動作します。

## Client

- 読み上げを実行するクライアントです。
- Controllerにターミナルで呼び出され、読み上げを開始します。
- `/leave` コマンドを受け取ります。

## Controller

- `/join` コマンドを受け取ります。
- Clientをターミナルで呼び出します。

## その他

### texts

- ボットが送信するすべての日本語メッセージは、`Texts`インターフェースに従うオブジェクトから読み出されます。
- テキストを変更したり、あとでローカライズしたりする可能性を考慮して、このような設計になっています。

# How to run

- Client、Controllerともに、Dockerイメージを環境変数を渡して実行することで動作します。
- `docker-compose.override.yml` から環境変数を渡すことを想定しています。
- `docker-compose.override.yml` の設定次第で、Clientのみ、Controllerのみを動かすことも可能です。

## 手順

1. install npx
2. `npx hygen init client`
3. `docker-compose up -d --build`

### 補足
- `npx hygen init client`で設定を行うことで、`docker-compose.override.yml`が生成されます