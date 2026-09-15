/*
    Author: iTz Arshia
    Github: https://github.com/iTzArshia/Discord-Music-Bot
    Current Version: 2.0.0
    DiscordJs Version: 14.15.3
    DisTube Version: 5.0.2
    @discordjs/voice Version: 0.17.0
*/

const Discord = require("discord.js");
const fs = require("node:fs");
const express = require("express");

// Discord Client Constructor
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildVoiceStates,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent,
    ],
});

client.MessageCommands = new Discord.Collection();
client.SlashCommands = new Discord.Collection();
client.CurrentSongs = [];

module.exports.client = client;

// Load DisTube
require("./distube");

// Event Handler
console.log("Loading Discord Events");

const discordEvents = fs
    .readdirSync("./events/discord/")
    .filter((file) => file.endsWith(".js"));

for (const file of discordEvents) {
    const event = require(`./events/discord/${file}`);
    client.on(file.split(".")[0], event.bind(null, client));
}

// DisTube Event Handler
console.log("Loading DisTube Events");

const distubeEvents = fs
    .readdirSync("./events/distube/")
    .filter((file) => file.endsWith(".js"));

for (const file of distubeEvents) {
    const event = require(`./events/distube/${file}`);
    client.distube.on(file.split(".")[0], event.bind(null, client));
}

// Message Command Handler
console.log("Loading Message Commands");

const messageCommands = fs
    .readdirSync("./commands/messages/")
    .filter((file) => file.endsWith(".js"));

for (const file of messageCommands) {
    const command = require(`./commands/messages/${file}`);
    client.MessageCommands.set(command.name.toLowerCase(), command);
}

// Slash Command Handler
console.log("Loading Slash Commands");

const slashCommands = fs
    .readdirSync("./commands/interactions/")
    .filter((file) => file.endsWith(".js"));

for (const file of slashCommands) {
    const command = require(`./commands/interactions/${file}`);
    client.SlashCommands.set(command.data.name, command);
}

// Anti Crash
process.on("unhandledRejection", (reason, p) => {
    console.log("[antiCrash] :: Unhandled Rejection/Catch");
    console.log(reason?.stack || reason, p);
});

process.on("uncaughtException", (err, origin) => {
    console.log("[antiCrash] :: Uncaught Exception/Catch");
    console.log(err?.stack || err, origin);
});

process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.log("[antiCrash] :: Uncaught Exception/Catch (MONITOR)");
    console.log(err?.stack || err, origin);
});

// Keep-alive web server
const app = express();

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
    res.status(200).send("Discord bot is online.");
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Keep-alive server is running on port ${PORT}`);
});

// Discord Client login
const token = process.env.DISCORD_TOKEN;

if (!token) {
    console.error("❌ DISCORD_TOKEN is missing!");
    process.exit(1);
}

console.log("🔑 DISCORD_TOKEN found. Logging into Discord...");

client.login(token)
    .then(() => {
        console.log("✅ Discord login successful!");
    })
    .catch((error) => {
        console.error("❌ Discord login failed!");
        console.error(error);
        process.exit(1);
    });