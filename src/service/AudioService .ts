import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnection
} from "@discordjs/voice";

import path from "node:path";

export class AudioService {

  private basePath: string;

  constructor() {
    this.basePath = process.env.AUDIO_FILES_URL || "./audios";
  }

  public play(connection: VoiceConnection, soundName: string) {
    const filePath = path.join(this.basePath, `${soundName}.mp3`);

    const player = createAudioPlayer();
    const resource = createAudioResource(filePath);

    player.play(resource);

    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {
      connection.destroy();
    });

    player.on("error", (error) => {
      connection.destroy();
    });
  }
}