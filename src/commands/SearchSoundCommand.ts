import type { Message } from "discord.js";
import { youtubeDl } from "youtube-dl-exec";

export class SearchSoundCommand {

    constructor() { }

    public async execute(message: Message) {
        try {
            if (!message.content.includes("!search")) return;
            const args = message.content.split(" ").slice(1);
            if (args.length === 0) {
                await message.reply("You need to specify a sound name to search for.");
                return;
            }

            const output = await youtubeDl(`ytsearch5:${args.join(" ")}`, {
                dumpSingleJson: true,
                flatPlaylist: true,
                noWarnings: true,
                noCheckCertificates: true,
            });
            if (typeof output !== "object" && output !== null) {
                return;
            }
            const entries = (output as any).entries;

            if (!entries || entries.length === 0) {
                await message.reply(`Nenhum resultado encontrado para "${args.join(" ")}".`);
                return;
            }
            const formattedResults = entries
                .map((video: any, index: number) => `${index + 1}. **${video.title}**\n${video.url}`)
                .join("\n\n");

            await message.reply(`Search results for "${args.join(" ")}":\n${formattedResults}`);
        } catch (error) {
            console.error("Error searching for sound:", error);
            await message.reply("An error occurred while searching for the sound. Please try again later.");
            return;
        }
    }

}
