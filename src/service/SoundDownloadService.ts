import { youtubeDl } from "youtube-dl-exec";
import type { VideoMetadata } from "../domain/VideoMetadata.js";

export class SoundDownloaderService {

    public async getVideoMetadata(target: string): Promise<VideoMetadata | null> {
        const output: any = await youtubeDl(target, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            retries: process.env.YOUTUBE_DL_RETRIES ? parseInt(process.env.YOUTUBE_DL_RETRIES) : 3,
            fragmentRetries: process.env.YOUTUBE_DL_RETRIES ? parseInt(process.env.YOUTUBE_DL_RETRIES) : 3,
        });

        if (output === null || typeof output !== "object") {
            return null;
        }

        const videoData = output.entries ? output.entries[0] : output;

        if (!videoData) return null;

        return {
            title: videoData.title,
            duration: videoData.duration,
            filesize_approx: videoData.filesize_approx,
        };
    }

    public async downloadAudio(target: string, outputPath: string): Promise<void> {
        await youtubeDl(target, {
            extractAudio: true,
            audioFormat: "mp3",
            output: outputPath,
            noWarnings: true,
            retries: process.env.YOUTUBE_DL_RETRIES ? parseInt(process.env.YOUTUBE_DL_RETRIES) : 3,
            fragmentRetries: process.env.YOUTUBE_DL_RETRIES ? parseInt(process.env.YOUTUBE_DL_RETRIES) : 3,
        });
    }
}