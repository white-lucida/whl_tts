import { IntentsBitField } from "discord.js";

import { Env } from "@humanwhocodes/env";
import { TTSClient } from "./client";

const client = new TTSClient({
  intents: [
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.Guilds,
  ],
});

const env = new Env();
const { DISCORD_TOKEN } = env.exists;

client.login(DISCORD_TOKEN);
