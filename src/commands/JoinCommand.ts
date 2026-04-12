import { entersState, joinVoiceChannel, VoiceConnectionStatus } from "@discordjs/voice";
import type { Message } from "discord.js";
import { AudioService } from "../service/AudioService.js";
import { ObjectStorageService } from "../service/ObjectStorageService.js";

export class JoinCommand {

    constructor(
    ) { }

    public async execute(message: Message) {
        if (!message.content.includes("!join")) return;
        const soundName = message.content.split(' ');
        if (!soundName[1] || !soundName[1].trim().length) {
            await message.reply("You need to specify a sound");
            return;
        }

        if (!message.guild) return;

        const member = message.member;
        const channel = member?.voice.channel;

        if (!channel) {
            await message.reply("You need to be on a voice channel.");
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
            audioService.play(connection, String(soundName[1].trim()));
        } catch (error) {
            await message.reply("I didnt have this sound here broo");
            connection.destroy();
        }
    }

}