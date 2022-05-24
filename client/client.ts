import { Client, ClientOptions, Guild, TextChannel } from "discord.js";
import { registerJoinMessageHandler } from "./controle/join";
import { registerLeaveInteractionHandler } from "./controle/leave";
import { TextChannelSpeaker } from "./speaker";

class GuildSpeakerMap extends Map<Guild, TextChannelSpeaker | null> {
  attach(guild: Guild, speaker: TextChannelSpeaker) {
    this.set(guild, speaker);
  }

  detach(guild: Guild) {
    this.set(guild, null);
  }
}

/**
 * 参加/退出処理、読み上げ接続情報を保持した`Client`です。
 */
export class TTSClient extends Client {
  /**
   * `Guild`に対して、対応する`Guild`内に存在する`TextChannelSpeaker`を割り当てる`Map`です。
   * ボットがその`Guild`内で読み上げを行っていない状態では、値は`null`になります。
   */
  guildSpeakerMap: GuildSpeakerMap;

  constructor(options: ClientOptions) {
    super(options);
    this.guildSpeakerMap = new GuildSpeakerMap();

    this.once("ready", () => {
      this.guildSpeakerMap = new GuildSpeakerMap(this.guilds.cache.map(guild => [guild, null]));
    });

    registerJoinMessageHandler(this);
    registerLeaveInteractionHandler(this);
  }
}