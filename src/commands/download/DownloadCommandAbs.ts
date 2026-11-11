import path from "path";
import type { VideoMetadata } from "../../domain/VideoMetadata.js";
import { SoundDownloaderService } from "../../service/SoundDownloadService.js";
import { randomUUID } from "crypto";

export abstract class DownloadCommandAbs {
    protected soundService: SoundDownloaderService;
    private readonly MAX_DURATION_SECONDS = 600;

    constructor() {
        this.soundService = new SoundDownloaderService();
    }

    protected async getVideoMetadata(soundUrl: string): Promise<VideoMetadata | null> {
        return await this.soundService.getVideoMetadata(soundUrl);
    }

    protected getOutputPath(): string {
        return path.join(process.env.TMPDIR || "/tmp", `${randomUUID()}.mp3`);
    }

    protected async downloadAudio(soundUrl: string, outputPath: string): Promise<void> {
        await this.soundService.downloadAudio(soundUrl!!, outputPath);
    }

    protected getTarget(args: string[]): string {
        const input = args.join(" ").trim();
        const urlRegex = /^(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/i;

        if (urlRegex.test(input)) {
            try {
                const urlObj = new URL(input.startsWith('http') ? input : `https://${input}`);
                urlObj.searchParams.delete('list');
                urlObj.searchParams.delete('start_radio');
                urlObj.searchParams.delete('index');
                return urlObj.toString();
            } catch {
                return input;
            }
        }

        return `ytsearch1:${input}`;
    }

    protected validateInput(args: string[]): string | null {
        if (args.length === 0) {
            return "You need to specify a sound URL or name to download.";
        }
        return null;
    }

    protected validateVideo(metadata: any): string | null {
        if (!metadata) {
            return "Failed to fetch video info.";
        }

        if (metadata.duration > this.MAX_DURATION_SECONDS) {
            return `The video is too long! Maximum allowed duration is ${this.MAX_DURATION_SECONDS / 60} minutes.`;
        }

        return null;
    }

}
