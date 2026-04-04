import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnection,
  StreamType
} from "@discordjs/voice";
import type { ObjectStorageService } from "./ObjectStorageService.js";


export class AudioService {

  constructor(
    private readonly storage: ObjectStorageService
  ) {}

  public async play(connection: VoiceConnection, soundName: string) {

    const key = `${soundName}.mp3`;

    const stream = await this.storage.getObjectStream(key);

    const player = createAudioPlayer();

    const resource = createAudioResource(stream, {
      inputType: StreamType.Arbitrary
    });

    player.play(resource);

    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    player.on("error", (error) => {
      console.error("Audio error:", error);
      connection.destroy();
    });
  }
}