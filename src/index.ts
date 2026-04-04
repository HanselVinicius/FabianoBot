import {
    Client,
    GatewayIntentBits,
} from "discord.js";

import { config } from "dotenv";
import { MessageCreatedHook } from "./hooks/MessageCreatedHook.js";

config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent
    ]
});

client.once("ready", () => {
    new MessageCreatedHook(client).execute();
    console.log("Bot started");
});

client.login(process.env.DISCORD_BOT_TOKEN);