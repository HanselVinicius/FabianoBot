import { entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import type { Message } from "discord.js";
import { AudioService } from "../service/AudioService.js";
import { ObjectStorageService } from "../service/ObjectStorageService.js";

export class JoinCommand {

    constructor(
    ) { }

    public async execute(message: Message) {
        if (message.content !== "!join") return;

        if (!message.guild) return;

        const member = message.member;
        const channel = member?.voice.channel;

        if (!channel) {
            message.reply("You need to be on a voice channel.");
            return;
        }

        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator
        });
        const audioService = new AudioService(new ObjectStorageService());
        try {
            await entersState(connection, VoiceConnectionStatus.Ready, 5000);

            audioService.play(connection, "sound");

        } catch (error) {
            console.error("Error:", error);
            connection.destroy();
        }

    }

}