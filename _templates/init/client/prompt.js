module.exports = {
  prompt: ({ prompter }) => {
    async function main() {
      const TERMINAL_CHANNEL_ID = await prompter.prompt({
        type: "input",
        name: "TERMINAL_CHANNEL_ID",
        message: "ターミナルのチャンネルIDを入力してください。"
      });

      const clients = await inputClient([]);
      const CONTROLLER_USER_ID = clients.length ? await prompter.prompt({
        type: "input",
        name: "CONTROLLER_USER_ID",
        message: "コントローラーのユーザーIDを入力してください。"
      }) : {};

      const requiredController = await prompter.prompt({
        type: "confirm",
        name: "REQUIRED_CONTROLLER",
        message: "コントローラーを設定しますか？"
      });

      const DISCORD_TOKEN = requiredController.REQUIRED_CONTROLLER ? await prompter.prompt({
        type: "input",
        name: "token",
        message: "コントローラーのトークンを入力してください。"
      }) : {};

      const result =  {
        ...TERMINAL_CHANNEL_ID,
        ...CONTROLLER_USER_ID,
        controller: DISCORD_TOKEN,
        clients
      };

      console.log(result);

      return result;
    }

    async function inputClient(clients) {
      const requiredMoreClient = await prompter.prompt({
        type: "confirm",
        name: "REQUIRED_CLIENT",
        message: "クライアント用コンテナを追加しますか？"
      });

      if (!requiredMoreClient.REQUIRED_CLIENT) return clients;

      const DISCORD_TOKEN = await prompter.prompt({
        type: "input",
        name: "token",
        message: "トークンを入力してください。"
      });

      return inputClient([...clients, { ...DISCORD_TOKEN }]);
    }

    return main();
  }
}