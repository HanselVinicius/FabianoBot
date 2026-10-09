import type { Message } from "discord.js";
import { DownloadCommandAbs } from "./DownloadCommandAbs.js";
import fs from "fs";
import { entersState, joinVoiceChannel, VoiceConnectionStatus, getVoiceConnection } from "@discordjs/voice";
import { LocalAudioService } from "../../service/LocalAudioService.js";

export class DownloadAndPlayCommand extends DownloadCommandAbs {
    private localAudioService: LocalAudioService;
    
    private static isProcessing = false;

    constructor() {
        super();
        this.localAudioService = new LocalAudioService();
    }

    public async execute(message: Message) {
        let outputPath: string | undefined;
        let downloadingMsg: Message | undefined;

        try {
            if (!message.content.includes("!play")) return;

            if (!message.guild) {
                await message.reply("This command can only be used in a server.");
                return;
            }

            const member = message.member;
            const channel = member?.voice.channel;

            if (!channel) {
                await message.reply("You need to be in a voice channel to play a sound.");
                return;
            }

            if (DownloadAndPlayCommand.isProcessing) {
                await message.reply("I am already processing a request. Please wait!");
                return;
            }

            const existingConnection = getVoiceConnection(message.guild.id);
            if (existingConnection) {
                await message.reply("I'm already playing something in a voice channel. Let me finish first!");
                return;
            }

            DownloadAndPlayCommand.isProcessing = true;

            const args = message.content.split(" ").slice(1);
            const inputError = this.validateInput(args);
            if (inputError) {
                await message.reply(inputError);
                return;
            }

            const soundUrl = args[0];

            const metadataMsg = await message.reply("Fetching video info...");
            const metadata = await this.getVideoMetadata(soundUrl!!);

            const videoError = this.validateVideo(metadata);
            if (videoError) {
                await metadataMsg.delete().catch(() => { });
                await message.reply(videoError);
                return; 
            }

            await metadataMsg.delete().catch(() => { });
            downloadingMsg = await message.reply(`Downloading **${metadata!.title}**, please wait...`);

            outputPath = this.getOutputPath();
            await this.downloadAudio(soundUrl!!, outputPath);

            await downloadingMsg.edit(`Playing **${metadata!.title}**...`);

            const connection = joinVoiceChannel({
                channelId: channel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
            });

            await entersState(connection, VoiceConnectionStatus.Ready, 5000);

            await this.localAudioService.playFileAndWait(connection, outputPath);

        } catch (error) {
            console.error("Error downloading or playing sound:", error);
            await message.reply("An error occurred while downloading or playing the sound.");
        } finally {
            DownloadAndPlayCommand.isProcessing = false;

            if (outputPath && fs.existsSync(outputPath)) {
                fs.unlinkSync(outputPath);
            }

            if (downloadingMsg) {
                await downloadingMsg.delete().catch(() => { });
            }
        }
    }
}