/**
 * ユーザーに表示するテキストの制御用オブジェクトが満たすインターフェースです。
 */
export interface Texts {
  /** 文字列「ヒント」 */
  HINT: string;
  /** 接続試行時メッセージ */
  connect: {
    /** ボイスチャンネルへの接続に成功したときのメッセージのタイトル */
    SUCEEDED_TO_CONNECT_TITLE: string;
    /** ボイスチャンネルへの接続に成功したときのメッセージの説明 */
    SUCEEDED_TO_CONNECT_DESCRIPTION: string;
    /** 接続先チャンネルを探しています */
    FETCHING_DIST_CHANNEL: string;
    /** 接続先チャンネルが見つからなかったときのメッセージのタイトル */
    DIST_CHANNEL_NOT_FOUND_TITLE: string;
    /** 接続先チャンネルが見つからなかったときのメッセージのヒント */
    DIST_CHANNEL_NOT_FOUND_HINT: string;
    /** ボイスチャンネルへの接続に失敗したときのメッセージのタイトル */
    FAILED_TO_CONNECT_TITLE: string;
    /** ボイスチャンネルへの接続に失敗したときのメッセージのヒント */
    FAILED_TO_CONNECT_HINT: string;
  };
  /** 退出試行時メッセージ */
  leave: {
    /** 退出に成功したときのメッセージ */
    SUCEEDED_TO_LEAVE: string;
    /** 退出に失敗したときのメッセージのタイトル */
    FAILED_TO_LEAVE_TITLE: string;
    /** 退出に失敗したときのメッセージのヒント */
    FAILED_TO_LEAVE_HINT: string;
    /** 接続先が不明だったときのメッセージのタイトル */
    CONNECTION_NOTFOUND_TITLE: string;
    /** 接続先が不明だったときのメッセージのヒント */
    CONNECTION_NOTFOUND_HINT: string;
  };
}

export const JP: Texts = {
  HINT: "ヒント",
  connect: {
    SUCEEDED_TO_CONNECT_TITLE: "ボイスチャンネルへの接続に成功しました。",
    SUCEEDED_TO_CONNECT_DESCRIPTION: [
      "ご利用いただきありがとうございます。",
      "",
      "このチャンネルでメッセージを送ると、内容がVCで読み上げられます。",
      "",
      "読み上げを終了したいときは、",
      "`/leave` コマンドを実行してください。",
    ].join("\n"),
    FETCHING_DIST_CHANNEL: "接続先チャンネルを探しています・・・",
    DIST_CHANNEL_NOT_FOUND_TITLE: "接続先チャンネルが見つかりませんでした。",
    DIST_CHANNEL_NOT_FOUND_HINT: [
      "ボイスチャンネルに接続してから",
      "もう一度お試しください。",
    ].join("\n"),
    FAILED_TO_CONNECT_TITLE: "ボイスチャンネルへの接続に失敗しました。",
    FAILED_TO_CONNECT_HINT: [
      "接続先チャンネルは取得できましたが、接続に失敗しました。",
      "",
      "時間をおいて、もう一度お試しください。",
      "",
      "このメッセージが繰り返し表示される場合は、運営までご連絡ください。",
    ].join("\n"),
  },
  leave: {
    SUCEEDED_TO_LEAVE: [
      "読み上げを終了しました。",
      "ご利用いただきありがとうございました。",
    ].join("\n"),
    FAILED_TO_LEAVE_TITLE: "ボイスチャンネルから退出できませんでした。",
    FAILED_TO_LEAVE_HINT: [
      "時間をおいて、もう一度お試しください。",
      "",
      "このメッセージが繰り返し表示される場合は、運営までご連絡ください。",
    ].join("\n"),
    CONNECTION_NOTFOUND_TITLE: "ボイスチャンネルに接続していません。",
    CONNECTION_NOTFOUND_HINT: [
      "ボットがボイスチャンネルに接続しているのにこのメッセージが表示される場合は、",
      "運営までご連絡ください。",
    ].join("\n"),
  },
};
