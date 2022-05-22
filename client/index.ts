import {
  createAudioPlayer,
  createAudioResource,
  CreateVoiceConnectionOptions,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
} from "@discordjs/voice";
import type { JoinVoiceChannelOptions } from "@discordjs/voice";
import {
  Client,
  Colors,
  IntentsBitField,
  Interaction,
  Message,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import { join } from "path";
import ffmpeg from "fluent-ffmpeg";

import * as fs from "fs";
import fetch from "node-fetch";
import { JP, Texts } from "./texts";

import { Env } from "@humanwhocodes/env";
import { TTSConnectionState } from "./state";

const client = new Client({
  intents: [
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.Guilds,
  ],
});

const state = new TTSConnectionState();
const env = new Env();
const { TERMINAL_CHANNEL_ID, CONTROLLER_USER_ID, DISCORD_TOKEN } = env.exists;

const getTexts = (interaction: Interaction): Texts => {
  return JP;
};

/**
 * メッセージ内容を受け取って、OpenJTalk APIからwavのArrayBufferを取得します。
 * @param content メッセージ内容
 */
const fetchWavBufferOpenJTalk = async (content: string) => {
  const resp = await fetch(`http://openjtalk:8080/voice?text=${content}`);
  return await resp.arrayBuffer();
};

/**
 * ボットをボイスチャンネルへ接続させます。
 * 接続時に`connection`が変更されます。
 * @param args `joinVoiceChannelOptions`の引数
 */
const connect = (
  args: JoinVoiceChannelOptions & CreateVoiceConnectionOptions,
) => joinVoiceChannel(args);

const isTerminalChannelMessage = (message: Message) =>
  message.channelId === TERMINAL_CHANNEL_ID;
const isControllerMessage = (message: Message) =>
  message.author.id === CONTROLLER_USER_ID;

client.on("messageCreate", async (message) => {
  const player = createAudioPlayer();
  if (!message.inGuild()) return;

  if (state.connection === null) {
    if (!isTerminalChannelMessage(message)) return;
    if (!isControllerMessage(message)) return;

    /* 管制メッセージと判断し以下その処理 */

    if (client.user === null) return; /* 型にnullの可能性があるので排除 */

    if (message.mentions.has(client.user)) {
      /* VC参加を要求されたと判断 */
      const channels = message.mentions.channels;
      const vc = channels.find((channel): channel is VoiceChannel =>
        channel.isVoice()
      );
      const textChannel = channels.find((channel): channel is TextChannel =>
        channel.isText()
      );

      if (vc === undefined || textChannel === undefined) {
        return; /* 型からundefinedを排除 */
      }

      const connection = connect({
        channelId: vc.id,
        guildId: vc.guildId,
        adapterCreator: vc.guild
          .voiceAdapterCreator as DiscordGatewayAdapterCreator,
        /*
          ここでdiscord.jsのバグによる型エラーが発生するので、as で強制的にキャストしています
        */
      });
      state.enter(connection, textChannel);
    } else {
      /* 対応可能者募集メッセージと判断 */
      await message.reply("OK");
    }
  }

  /* 以下通常の読み上げ処理 */

  try {
    const buffer = await fetchWavBufferOpenJTalk(message.content);

    fs.writeFileSync(
      "output.wav",
      new Uint8Array(buffer),
      {},
    );

    /* ffmpegで wav -> mp3 に変換する */
    ffmpeg("output.wav")
      .inputFormat("wav")
      .toFormat("mp3")
      .save("output.mp3")
      .on("end", () => {
        let resource = createAudioResource(join(__dirname, "output.mp3"));
        player.play(resource);

        if (state.connection) state.connection.subscribe(player);
      })
      .on("error", (e) => {
        console.log(e.message);
      });
  } catch (e) {
    console.log(e);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName !== "leave") return;
  const texts = getTexts(interaction);

  if (state.connection === null) {
    await interaction.reply({
      embeds: [{
        title: texts.leave.CONNECTION_NOTFOUND_TITLE,
        fields: [{
          name: texts.HINT,
          value: texts.leave.CONNECTION_NOTFOUND_HINT,
        }],
        color: Colors.DarkVividPink,
      }],
    });
    return;
  }

  const isDisconnectedSuccessfully = state.leave();
  if (isDisconnectedSuccessfully) {
    await interaction.reply(texts.leave.SUCEEDED_TO_LEAVE);
  } else {
    await interaction.reply({
      embeds: [{
        title: texts.leave.FAILED_TO_LEAVE_TITLE,
        fields: [{
          name: texts.HINT,
          value: texts.leave.FAILED_TO_LEAVE_HINT,
        }],
        color: Colors.DarkVividPink,
      }],
    });
  }
});

client.login(DISCORD_TOKEN);
