import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnection
} from "@discordjs/voice";

import fs from "node:fs";
import type { ObjectStorageService } from "./ObjectStorageService.js";

export class AudioService {

  private basePath: string;

  constructor(
    private readonly storage: ObjectStorageService
  ) {
    this.basePath = process.env.AUDIO_FILES_URL || "./audios";

    if (!fs.existsSync(this.basePath)) {
      fs.mkdirSync(this.basePath, { recursive: true });
    }
  }

  public async play(connection: VoiceConnection, soundName: string) {

    const key = `${soundName}.mp3`;

    const filePath = await this.storage.downloadToFile(key, this.basePath);

    const player = createAudioPlayer();

    const resource = createAudioResource(filePath);

    player.play(resource);

    connection.subscribe(player);

    player.on(AudioPlayerStatus.Idle, () => {

      fs.unlink(filePath, () => {});

      connection.destroy();
    });

    player.on("error", (error) => {
      console.error("Audio error:", error);

      fs.unlink(filePath, () => {});
      connection.destroy();
    });
  }
}