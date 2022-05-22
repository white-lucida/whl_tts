import { Client, Intents, Interaction, Message } from "discord.js";
import { JP, Texts } from "./texts";
import { Env } from "@humanwhocodes/env";

const client = new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES] });

const env = new Env();

const getTexts = (interaction: Interaction): Texts => {
  return JP;
};

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand() || interaction.channel === null) return;
  if (interaction.commandName !== "join") return;

  const texts = getTexts(interaction);
  await interaction.reply(texts.connect.FETCHING_DIST_CHANNEL);

  /*
    コマンド実行者のボイスチャンネルを取得します.
  */
  const voiceState = interaction.guild?.voiceStates.cache.find((state) =>
    state.member?.id === interaction.member?.user.id
  );
  if (voiceState === undefined || voiceState.channel === null) {
    await interaction.editReply({
      embeds: [{
        title: texts.connect.DIST_CHANNEL_NOT_FOUND_TITLE,
        fields: [
          {
            name: texts.HINT,
            value: texts.connect.DIST_CHANNEL_NOT_FOUND_HINT,
          },
        ],
        color: "DARK_VIVID_PINK",
      }],
    });
    return;
  }

  await interaction.editReply("ボットを入室させています・・・");

  const terminal = client.channels.cache.get(
    env.require("TERMINAL_CHANNEL_ID"),
  );
  if (terminal === undefined || !terminal.isText()) throw new Error();

  const callMessage = await terminal.send("--- CALL OF CLIENT ---");

  const isClientResponse = (msg: Message) => {
    const isSelfResponse = msg.author.id === client?.user?.id;
    const isCorrectReference = msg.reference?.messageId === callMessage.id;

    return !isSelfResponse && isCorrectReference;
  };
  const responses = await terminal.awaitMessages({
    max: 1,
    time: 10,
    filter: isClientResponse,
  });
  const msg = responses.first();

  /*
    呼びかけに対してボットの応答がなかった場合、利用できないと判断してエラーメッセージを返す
  */
  if (msg === undefined) {
    await interaction.editReply({
      embeds: [
        {
          title: texts.connect.BOTS_DONT_RESPONDED_TITLE,
          fields: [
            {
              name: texts.HINT,
              value: texts.connect.BOTS_DONT_RESPONDED_HINT,
            },
          ],
          color: "DARK_VIVID_PINK",
        },
      ],
    });
    return;
  }

  await msg.reply(
    `${msg.author} -> ${interaction.channel} / ${voiceState.channel}`,
  );
});

client.login(env.require("DISCORD_TOKEN"));
