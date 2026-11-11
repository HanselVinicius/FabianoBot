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
    try {
        new MessageCreatedHook(client).execute();
        console.log("Bot started successfully");
    } catch (error) {
        console.error("Error during startup hook initialization:", error);
    }
});

client.on("error", (error) => {
    console.error("Discord Client Error:", error);
});

process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception:", error);
});

client.login(process.env.DISCORD_BOT_TOKEN).catch((error) => {
    console.error("Failed to login to Discord:", error);
});