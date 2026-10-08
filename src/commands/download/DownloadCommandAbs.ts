import { SoundDownloaderService } from "../../service/SoundDownloadService.js";

export abstract class DownloadCommandAbs {
    protected soundService: SoundDownloaderService;
    private readonly MAX_DURATION_SECONDS = 600;

    constructor() {
        this.soundService = new SoundDownloaderService();
    }


    protected validateInput(args: string[]): string | null {
        if (args.length === 0) {
            return "You need to specify a sound to download.";
        }

        const soundUrl = args[0];
        if (!soundUrl) {
            return "You need to provide a valid sound URL.";
        }

        const urlRegex = /^(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/i;
        if (!urlRegex.test(soundUrl)) {
            return "The provided sound URL is not valid. Please provide a valid URL.";
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
