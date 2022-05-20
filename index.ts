import ffi = require("ffi-napi");
import ref = require("ref-napi");
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, VoiceConnection, createAudioResource } = require("@discordjs/voice");
import { Client, Intents, MessageActionRow } from "discord.js";
const { join } = require('path');
import ffmpeg = require("fluent-ffmpeg");
import kuromoji = require("kuromoji");

import * as fs from "fs";

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILDS]});
const sizeType = ref.refType("int64 *");
const charPtr = ref.refType("char *");
const talk = ffi.Library("aqtk1-lnx-eva/lib64/f1/libAquesTalk", { // パス ok
  "AquesTalk_Synthe_Utf8": [ref.refType("char *"), [charPtr, "int", sizeType]], // 関数名 ok
  "AquesTalk_FreeWave": ["void", [ref.refType("char *")]]
});

let connection: typeof VoiceConnection | null = null;

const convertErrorCode = (code: number | null) => {
  switch (code) {
    case 100:
      return "その他のエラー"
    case 101:
      return "メモリ不足"
    case 102:
    case 105:
      return "音声記号列に未定義の読み記号が指定された"
    case 103:
      return "韻律データの時間長がマイナスになっている"
    case 104:
      return "エンジン内部エラー（未定義の区切りコード検出）"
    case 106:
      return "音声記号列のタグの指定が正しくない"
    case 107:
      return "タグの長さが制限を超えている（または「>」が見つからない）"
    case 108:
      return "タグ内の値の指定が正しくない"
    case 109:
    case 110:
      return "WAVE再生ができない"
    case 111:
      return "発生すべきデータがない"
    case 200:
      return "音声記号列が長すぎる"
    case 201:
      return "1つのフレーズ中の読み記号が多すぎる"
    case 202:
    case 204:
      return "音声記号列が長い（内部バッファオーバー）"
    case 203:
      return "ヒープメモリ不足"
    case 205:
      return "ライセンスキーが正しくない。"
    default:
      return `音声記号列エラー（エラー発生位置：${code}）`
  }
}

const s = (target: string) => {
  console.log(s);
  const pointer = ref.alloc(sizeType)
  const str = ref.alloc(charPtr);

  str.writePointer(Buffer.from(target, "utf-8"));
  console.log("ポインタサンプル：")
  console.log(str);

  const b = Buffer.from(target, "utf-8");
  console.log(b);
  console.log((b ?? "（空文字列）").toString());

  // @ts-ignore
  const value = talk.AquesTalk_Synthe_Utf8(b, 100, pointer);
  console.log(value);
  

  if (value.isNull()) {
    const errCode = pointer.readPointer().readInt64BE();
    throw new Error(convertErrorCode(Number(errCode)))
  }
  return value;
}

const builder = kuromoji.builder({
  // ここで辞書があるパスを指定します。今回は kuromoji.js 標準の辞書があるディレクトリを指定
  dicPath: 'node_modules/kuromoji/dict'
});

const hiraganize = (content: string) => {
  let solution = "";

  return new Promise<string>((resolve, reject) => {
    builder.build((err, tokenizer) => {
      if(err) { throw err; }
      const tokens = tokenizer.tokenize(content);
      solution = tokens.map(token => token.reading ?? "").join("'")
      resolve(solution);
    });
  });
}

client.on("messageCreate", async (message) => {
  if (message.author.username !== "To--") return;
  const player = createAudioPlayer();
  try {
    
    const getWav = async () => {
      try {
        const hiragana = await hiraganize(message.content);
        if (!hiragana) return null;
        return s(hiragana);
      } catch (err: any) {
        await message.reply("音声合成に失敗しました。\n" + err.message);
        return null;
      }
    }

    const value = await getWav();
    if (value === null) return;
      
    fs.writeFile("output.wav", new Uint8Array(value.buffer), {}, () => {
      ffmpeg("output.wav")
      .inputFormat("wav")
      .toFormat('mp3')
      .save("output.mp3")
      .on('end', () => {
        console.log(`変換完了`);
        talk.AquesTalk_FreeWave(value);
        let resource = createAudioResource(join(__dirname, 'output.mp3'));
        player.play(resource);

        if (connection) connection.subscribe(player);

      })

      
    });
  } catch (e) {
    console.log(e);
  }
});

client.once("ready", async () => {
  const channel = client.guilds.cache.get("813577333516402728")?.channels.cache.get("813589296145104917");
  if (!channel) return;
  joinVoiceChannel({
    channelId: "813589296145104917",
    guildId: "813577333516402728",
    adapterCreator: channel.guild.voiceAdapterCreator
  });


  connection = getVoiceConnection(channel.guildId) ?? null;
});

// client.login("");