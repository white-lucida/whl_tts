import { AudioPlayer, AudioResource, getVoiceConnection, VoiceConnection } from "@discordjs/voice";
import { Guild } from "discord.js";

interface AbstractQueue<ResourceType> {
  resources: ResourceType[];
  add(resource: ResourceType): void;
  skip(): void;
  next(): ResourceType | null;
  get currentResource(): ResourceType | null;
}

/**
 * キューのDiscordに依存しない部分の基本的な実装
 */
class Queue<ResourceType> implements AbstractQueue<ResourceType> {
  resources: ResourceType[];
  constructor() {
    this.resources = [];
  }

  add(resource: ResourceType) {
    this.resources.push(resource);
  }

  skip() {
  }

  /**
   * キューを一つ進めます。もともとあった先頭の要素は配列から削除されます。
   * @returns 新しい先頭の要素
   */
  next() {
    this.resources = this.resources.slice(1); // 先頭の要素だけを削除した配列
    return this.currentResource;
  }

  /**
   * 先頭の`resource`を返します。
   * これは再生中の`resource`を表します。
   */
  get currentResource() {
    return this.resources.at(0) ?? null;
  }
}

export class GeneratedVoicePlayer {
  queue: Queue<AudioResource>;
  player: AudioPlayer;
  guild: Guild;
  constructor(player: AudioPlayer, guild: Guild) {
    this.queue = new Queue();

    this.player = player;

    /**
     * @todo unsubscribe & ended だと、skipしたときにendedがtrueにならずに（読み切ってないので）、そのままリソースとして残るのでは？
     */
    this.player.addListener("unsubscribe", () =>{
      /* 再生終了 */

      /* 再生が終了したリソース（先頭リソース）を削除 */
      this.queue.next();
      /* 次のリソースを再生する */
      this.play();
    });

    this.guild = guild;
  }

  /**
   * `AudioResource`をキューに追加します。
   * すぐ再生することが可能な場合は、そのまま再生します。
   * すぐに再生できない場合、順番が来たときに自動的に再生されます。
   * @param resource キューに追加する`AudioResource`
   */
  public add(resource: AudioResource) {
    this.queue.add(resource);

    if (!this.queue.resources.length) this.play();
  }

  /**
   * 先頭の`AudioResource`を再生します。
   * キューが空だった場合、何も再生しません。
   */
  private play() {
    const currentResource = this.queue.currentResource;
    if (currentResource === null) return;

    const connection = getVoiceConnection(this.guild.id);
    this.player.play(currentResource);
    assertsConnectionConnecting(connection);
    
    connection.subscribe(this.player);
  }
}

function assertsConnectionConnecting (arg: ReturnType<typeof getVoiceConnection>): asserts arg is VoiceConnection {
  if (arg === undefined) throw new Error();
}