
import type { Message } from "discord.js";

export class CallBroosCommand {

    public async execute(message: Message) {
        if (!message.content.includes("!call")) return;
        const args = message.content.slice("!call".length).trim().split(/ +/g);
        await this.callBroos(message, args);
    }

    private async callBroos(message: Message, args: string[]) {
        try {
            const url = process.env.NOCTIS_API_URL || "http://localhost:3000/api/whatsapp/call";
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": process.env.NOCTIS_API_KEY || ""
                },
                body: JSON.stringify({
                    message: `CHAMADO PARA O DISCORD MENSAGEM: ${args.join(", ")}`,
                })
            });
            if (res.status % 200 !== 0) {
                await message.reply("Failed to call Broos. Please try again later.");
                return;
            }
            await message.reply(`Calling Broos with args: ${args.join(", ")}`);
        } catch (error) {
            await message.reply("Failed to call Broos. Please try again later.");
        }
    }
}