const {
  joinVoiceChannel,
  getVoiceConnection,
  createAudioPlayer,
  VoiceConnection,
  createAudioResource,
} = require("@discordjs/voice");
import { Client, Intents } from "discord.js";
const { join } = require("path");
import ffmpeg = require("fluent-ffmpeg");

import * as fs from "fs";
import fetch from "node-fetch";
import { JP } from "./messages";

const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILDS,
  ],
});
let connection: typeof VoiceConnection | null = null;

/**
 * メッセージ内容を受け取って、VOICEVOX APIからwavのArrayBufferを取得します。
 * 
 * @example
 * const buffer = await fetchWavBuffer("hoge");
 * @param message メッセージ内容
 */
const fetchWavBufferVoiceVox = async (content: string) => {
  const queryResp = await fetch(
    `http://voicevox:50021/audio_query?text=${content}&speaker=1`,
    { method: "POST" },
  );
  const query = await queryResp.json();

  const synthResp = await fetch("http://voicevox:50021/synthesis?speaker=1", {
    /* utf-8で渡さないとエラーが発生したためエンコード */
    body: new TextEncoder().encode(JSON.stringify(query)),
    method: "POST",
  });
  return await synthResp.arrayBuffer();
}

/**
 * メッセージ内容を受け取って、OpenJTalk APIからwavのArrayBufferを取得します。
 * @param content メッセージ内容
 */
const fetchWavBufferOpenJTalk = async (content: string) => {
  const resp = await fetch(`http://openjtalk:8080/voice?text=${content}`);
  return await resp.arrayBuffer();
}

client.on("messageCreate", async (message) => {
  const player = createAudioPlayer();
  if (!message.inGuild() || connection === null) {
    console.log(connection);
    return;
  }

  try {
    const buffer = await fetchWavBufferOpenJTalk(message.content);

    fs.writeFileSync(
      "output.wav",
      new Uint8Array(buffer),
      {},
    );
    ffmpeg("output.wav")
      .inputFormat("wav")
      .toFormat("mp3")
      .save("output.mp3")
      .on("end", () => {
        let resource = createAudioResource(join(__dirname, "output.mp3"));
        player.play(resource);

        if (connection) connection.subscribe(player);
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
  if (interaction.commandName !== "join") return;
  await interaction.reply("接続先チャンネルを探しています・・・");

  const state = interaction.guild?.voiceStates.cache.find((state) =>
    state.member?.id === interaction.member.user.id
  );
  if (state === undefined) {
    await interaction.editReply("ボイスチャンネルが見つかりませんでした。");
    return;
  }

  try {
    joinVoiceChannel({
      channelId: state.channelId,
      guildId: state.guild.id,
      adapterCreator: state.guild.voiceAdapterCreator,
    });
    connection = getVoiceConnection(interaction.guildId) ?? null;
    await interaction.editReply({
      embeds: [{
        title: JP.CONNECT_SUCEEDED_TITLE,
        description: JP.CONNECT_SUCEEDED_DESCRIPTION,
        fields: [{ name: JP.CREDIT_TITLE, value: JP.CREDIT_DESCRIPTION }],
        color: "GREEN",
      }],
    });
  } catch {
    await interaction.editReply("ボイスチャンネルへの接続に失敗しました。");
  }
});

client.login(process.env.DISCORD_TOKEN);
