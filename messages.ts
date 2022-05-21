/**
 * ユーザーに表示するテキストの制御用オブジェクトが満たすインターフェースです。
 */
interface Messages {
  /** ボイスチャンネルへの接続に成功したときのメッセージのタイトル */
  CONNECT_SUCEEDED_TITLE: string;
  /** ボイスチャンネルへの接続に成功したときのメッセージの説明 */
  CONNECT_SUCEEDED_DESCRIPTION: string;
  /** クレジット表記タイトル */
  CREDIT_TITLE: string;
  /** クレジット表記説明  */
  CREDIT_DESCRIPTION: string;
}

export const JP: Messages = {
  CONNECT_SUCEEDED_TITLE: "ボイスチャンネルへの接続に成功しました。",
  CONNECT_SUCEEDED_DESCRIPTION: [
    "ご利用いただきありがとうございます。",
    "",
    "このチャンネルでメッセージを送ると、内容がVCで読み上げられます。",
    "",
    "読み上げを終了したいときは、",
    "`/leave` コマンドを実行してください。",
  ].join("\n"),
  CREDIT_TITLE: "クレジット表記",
  CREDIT_DESCRIPTION: [
    "このボットの読み上げ機能は、",
    "",
    "テキスト読み上げソフトウェア[VOICEVOX](https://voicevox.hiroshiba.jp/)の",
    "音声合成エンジンによって実現されています。",
    "",
    "©VOICEVOX:四国めたん"
  ].join("\n")
};
