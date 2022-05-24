import { Colors } from "discord.js";
import { TTSClient } from "../client";
import { getTexts } from "../utils/get_texts";

export const registerLeaveInteractionHandler = (client: TTSClient) => 
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand()) return;
    if (!interaction.inGuild()) return;
    if (interaction.commandName !== "leave") return;

    const texts = getTexts();

    if (interaction.guild === null) return;
    const speaker = client.guildSpeakerMap.get(interaction.guild);

    if (!speaker) {
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

    speaker.destroy();
    client.guildSpeakerMap.detach(interaction.guild);
    await interaction.reply(texts.leave.SUCEEDED_TO_LEAVE);
  });