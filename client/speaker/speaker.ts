/**
 * サーバーごとに保持されるTTSモジュール.
 */

import { Message, MessageCollector, TextChannel } from "discord.js";
import { generateOpenJTalkVoiceReadableStream } from "./generate";
import { GeneratedVoicePlayer } from "./queue";
import { Readable } from "stream";
import { createAudioResource, getVoiceConnection } from "@discordjs/voice";

export class TextChannelSpeaker {
  sourceTextChannel: TextChannel;
  private voicePlayer: GeneratedVoicePlayer;
  private messageCollector: MessageCollector

  constructor(sourceTextChannel: TextChannel, voicePlayer: GeneratedVoicePlayer) {
    this.sourceTextChannel = sourceTextChannel;
    this.voicePlayer = voicePlayer;
    this.messageCollector = sourceTextChannel.createMessageCollector({});

    this.messageCollector.addListener("collect", (message: Message) => {
      this.generateReadableVoice(message.content).then((readableVoice) => {
        if (readableVoice === null) return;

        const resource = createAudioResource(readableVoice);
        this.voicePlayer.add(resource);
      })
    });
  }

  /**
   * OpenJTalkの`Readable`音声データを生成します。
   * @param content メッセージ内容
   * @returns `Readable`
   */
  async generateReadableVoice (content: string){
    const stream = await generateOpenJTalkVoiceReadableStream(content);
    if (stream === null) return null;
    const readable = new Readable();
    return readable.wrap(stream);
  }

  /**
   * ボイスチャンネルの接続を終了します。
   */
  destroy() {
    const conncetion = getVoiceConnection(this.sourceTextChannel.guildId);
    conncetion?.destroy();
  }
}