import ffmpeg from "fluent-ffmpeg";
import { Duplex, Readable } from "stream";
import fetch from "node-fetch";

type VoiceGenerater = (
  content: string,
) => Readable | PromiseLike<Readable> | null | PromiseLike<null>;

/**
 * メッセージ内容を受け取って、OpenJTalk APIからwavのReadableStreamを取得します。
 * @param content メッセージ内容
 */
export const generateOpenJTalkVoiceReadableStream = async (content: string) => {
  const resp = await fetch(`http://openjtalk:8080/voice?text=${content}`);  
  return resp.body;
};

export const generateVoice = async (
  source: string,
  generater: VoiceGenerater,
) => {
  const wavReadable = await generater(source);
  if (wavReadable === null) return;
  
  const mp3Output = new Duplex();
  const promise = new Promise<Duplex>((resolve, reject) =>
    ffmpeg({ source: wavReadable })
      .inputFormat("wav")
      .toFormat("mp3")
      .pipe(mp3Output)
      .on("end", () => {
        resolve(mp3Output);
      })
      .on("error", (e) => {
        reject(e);
      })
  );
  return promise;
};
