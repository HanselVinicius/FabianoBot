import { randomUUID } from "crypto";
import { Message } from "discord.js";
import path from "path";
import fs from "fs";
import { DownloadCommandAbs } from "./DownloadCommandAbs.js";

export class DownloadSoundCommand extends DownloadCommandAbs {

    constructor() {
        super();
    }

    public async execute(message: Message) {
        let outputPath: string | undefined;
        let downloadingMsg: Message | undefined;

        try {
            if (!message.content.includes("!download")) return;
            const args = message.content.split(" ").slice(1);

            const inputError = this.validateInput(args);
            if (inputError) {
                await message.reply(inputError);
                return;
            }

            const soundUrl = args[0];

            const metadataMsg = await message.reply("Fetching video info...");
            const metadata = await this.soundService.getVideoMetadata(soundUrl!!);

            const videoError = this.validateVideo(metadata);
            if (videoError) {
                await metadataMsg.delete().catch(() => { });
                await message.reply(videoError);
                return;
            }

            await metadataMsg.delete().catch(() => { });
            downloadingMsg = await message.reply(`Downloading **${metadata!!.title}**, please wait...`);

            const fileName = `${randomUUID()}.mp3`;
            outputPath = path.join(process.env.TMPDIR || "/tmp", fileName);

            await this.soundService.downloadAudio(soundUrl!!, outputPath);

            await message.reply({
                files: [outputPath],
            });

        } catch (error) {
            console.error("Error downloading sound:", error);
            await message.reply("An error occurred while downloading the sound. Please try again later.");
        } finally {
            if (outputPath && fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }
            if (downloadingMsg) {
                await downloadingMsg.delete().catch(() => { });
            }
        }
    }

}
