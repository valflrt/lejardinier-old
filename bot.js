const discord = require("discord.js");
const { execSync } = require("child_process");
require("colors");

const commands = require("./commands");
const reader = require("./reader");
const utils = require("./utils");

const config = require("./config.json");
const token = require("./token.json");

try {
	execSync("sh ./update.sh", (err) => err && console.log(err)); // update files from github
} catch (e) { };

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

	// messageInfo contains the required information to run all the commands
	const messageInfo = utils.setupMessage({ message, bot }); // setup message (adding methods) and creating messageInfo ({message, bot})

	// listeners

	reader.listen(messageInfo); // simple fontion reading messages and replying in particular cases
	commands.listen(messageInfo); // listen to command calls

	return;

});

bot.login(token);