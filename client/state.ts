import type { TextBasedChannel } from "discord.js";
import type { VoiceConnection } from "@discordjs/voice";

/**
 * 読み上げ先ボイスチャンネルの接続と、読み上げるテキストチャンネルを保持します。
 */
export class TTSConnectionState {
  private _connection: VoiceConnection | null;
  private _textChannel: TextBasedChannel | null;
  constructor() {
    this._connection = null;
    this._textChannel = null;
  }

  /**
   * テキストチャンネルに入室する際に、接続情報を更新するためのメソッドです。
   * @param connection 接続情報
   * @param textChannel 読み上げるテキストチャンネル
   */
  enter(connection: VoiceConnection, textChannel: TextBasedChannel) {
    this._connection = connection;
    this._textChannel = textChannel;
  }

  /**
   * テキストチャンネルを退室する際に、接続情報を消すメソッドです。
   */
  leave() {
    const isSuceededToDisconnect = this._connection !== null
      ? this._connection.disconnect()
      : false;
    this._connection = null;
    this._textChannel = null;
    return isSuceededToDisconnect;
  }

  /**
   * 現在ボイスチャンネルに接続しているかどうかを返します。
   */
  get isConnecting() {
    return this._connection !== null;
  }

  /**
   * Discordボットの接続情報を返します。
   * 起動開始からまだ入室していない、あるいは退出したあとまだ入室が行われていない、などの場合には `null` を返す可能性があります。
   */
  get connection() {
    return this._connection;
  }

  /**
   * 読み上げるテキストチャンネルを返します。
   * 起動開始からまだ入室していない、あるいは退出したあとまだ入室が行われていない、などの場合には `null` を返す可能性があります。
   */
  get textChannel() {
    return this._textChannel;
  }
}
