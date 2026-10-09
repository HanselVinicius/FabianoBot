import { youtubeDl } from "youtube-dl-exec";
import type { VideoMetadata } from "../domain/VideoMetadata.js";

export class SoundDownloaderService {

    public async getVideoMetadata(url: string): Promise<VideoMetadata | null> {
        const output = await youtubeDl(url, {
            dumpSingleJson: true,
            noWarnings: true,
            noCheckCertificates: true,
            retries: process.env.YOUTUBE_DL_RETRIES ? parseInt(process.env.YOUTUBE_DL_RETRIES) : 3,
            fragmentRetries: process.env.YOUTUBE_DL_RETRIES ? parseInt(process.env.YOUTUBE_DL_RETRIES) : 3,
        });
        if (output === null || typeof output !== "object") {
            return null
        }
        return {
            title: output.title,
            duration: output.duration,
            filesize_approx: output.filesize_approx,
        };
    }


    public async downloadAudio(url: string, outputPath: string): Promise<void> {
        await youtubeDl(url, {
            extractAudio: true,
            audioFormat: "mp3",
            output: outputPath,
            noWarnings: true,
            retries: process.env.YOUTUBE_DL_RETRIES ? parseInt(process.env.YOUTUBE_DL_RETRIES) : 3,
            fragmentRetries: process.env.YOUTUBE_DL_RETRIES ? parseInt(process.env.YOUTUBE_DL_RETRIES) : 3,
        });
    }
}
