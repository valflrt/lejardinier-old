const discord = require("discord.js");
require("colors");

const reader = require("./reader");
const MessageInfo = require("./message");

const config = require("./config/config.json");
const token = require("./config/token.json");

const bot = new discord.Client();

bot.on("ready", async () => {

	// verifications and console logging

	console.log("\033c");

	await bot.user.setUsername(config.username)
		.then(client => console.log(` ${"[+]".green} Username set to ${(client.username).cyan}`));

	await bot.user.setPresence((config.activity) ? {
		status: config.activity.status,
		activity: {
			name: config.activity.list[0],
			type: config.activityType || "PLAYING"
		}
	} : null)
		.then(() => console.log(` ${"[+]".green} Presence set to ${config.activity.list[0].cyan} and status to ${config.activity.status.cyan}`));

	console.log(` ${"[+]".green} Logged in as: ${(bot.user.tag).cyan} - ${(bot.user.id).cyan}`);
	console.log("\n " + " connected ".bgGreen.black + "\n");

	reader.static(bot);

});

bot.on("message", async message => {

	console.log(`${message.author.username.cyan}${message.content !== "" ? `:` : ""} ${(message.content.includes(config.prefix) === true)
		? message.content.yellow
		: message.content} ${message.embeds.length !== 0 ? `[${message.embeds.length} embeds]`.green : ""}${message.attachments.size !== 0 ? ` [${message.attachments.size} attachements]`.green : ""}`); // logs every message

	if (message.author.bot) return; // skip if the author of the message is a bot

	// setup

	const messageInfo = new MessageInfo({ message, bot }); // create a message instance object (see more in ./message.js)

	reader.listen(messageInfo); // simple fontion reading messages and replying in particular cases

	// execute command

	if (messageInfo.command) messageInfo.command.execute(messageInfo);

});

bot.login(token);