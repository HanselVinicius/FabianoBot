import type { Client, Message } from "discord.js";
import { JoinCommand } from "../commands/JoinCommand.js";

export class MessageCreatedHook {

    constructor(
        private readonly client: Client
    ) { }

    async execute() {
        this.client.on("messageCreate", async (message: Message) => {
            new JoinCommand().execute(message);
        });
    }

}