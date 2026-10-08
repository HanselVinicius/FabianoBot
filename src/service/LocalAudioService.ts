import {
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  VoiceConnection
} from "@discordjs/voice";

export class LocalAudioService {

  public playFileAndWait(connection: VoiceConnection, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const player = createAudioPlayer();
      const resource = createAudioResource(filePath);

      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        resolve();
      });

      player.on("error", (error) => {
        console.error("Audio error:", error);
        connection.destroy();
        reject(error);
      });
    });
  }
}
