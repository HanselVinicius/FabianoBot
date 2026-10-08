import type { Client, Message } from "discord.js";
import { JoinCommand } from "../commands/JoinCommand.js";
import { CallBroosCommand } from "../commands/CallBroosCommand.js";
import { SearchSoundCommand } from "../commands/SearchSoundCommand.js";
import { DownloadSoundCommand } from "../commands/download/DownloadSoundCommand.js";
import { DownloadAndPlayCommand } from "../commands/download/DownloadAndPlayCommand.js";

export class MessageCreatedHook {

    constructor(
        private readonly client: Client
    ) { }

    async execute() {
        this.client.on("messageCreate", async (message: Message) => {
            new JoinCommand().execute(message);
            new CallBroosCommand().execute(message);
            new SearchSoundCommand().execute(message);
            new DownloadSoundCommand().execute(message);
            new DownloadAndPlayCommand().execute(message);
        });
    }

}
