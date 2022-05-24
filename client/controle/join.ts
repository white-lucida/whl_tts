import {
  createAudioPlayer,
  DiscordGatewayAdapterCreator,
  joinVoiceChannel,
  NoSubscriberBehavior,
} from "@discordjs/voice";
import { Env } from "@humanwhocodes/env";
import { Message, TextChannel, VoiceChannel } from "discord.js";
import { TTSClient } from "../client";
import { TextChannelSpeaker } from "../speaker";
import { GeneratedVoicePlayer } from "../speaker/queue";

const env = new Env();
const { TERMINAL_CHANNEL_ID, CONTROLLER_USER_ID } = env.exists;

const isTerminalChannelMessage = (message: Message) =>
  message.channelId === TERMINAL_CHANNEL_ID;
const isControllerMessage = (message: Message) =>
  message.author.id === CONTROLLER_USER_ID;

export const registerJoinMessageHandler = (client: TTSClient) =>
  client.on("messageCreate", async (message) => {
    if (!message.inGuild()) return;

    const speaker = client.guildSpeakerMap.get(message.guild);

    const isSpeakerOccupied = !speaker;
    if (isSpeakerOccupied) return;

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

      joinVoiceChannel({
        channelId: vc.id,
        guildId: vc.guildId,
        adapterCreator: vc.guild
          .voiceAdapterCreator as DiscordGatewayAdapterCreator,
        /*
            ここdiscord.jsのバグによる型エラーが発生するので、as で強制的にキャストしています
          */
      });

      client.guildSpeakerMap.attach(
        message.guild,
        new TextChannelSpeaker(
          textChannel,
          new GeneratedVoicePlayer(createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Stop } }), message.guild),
        ),
      );
    } else {
      /* 対応可能者募集メッセージと判断 */
      await message.reply("OK");
    }
    return;
  });
