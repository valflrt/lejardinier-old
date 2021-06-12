const discord = require("discord.js");

const randomItem = (...array) => array[Math.floor(Math.random() * array.length)];

const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

const randomPercentage = (bonus = false) => {
	let bonusValue;
	if (bonus !== false && Math.floor(Math.random() * 100) === 1) {
		bonusValue = 20 + Math.floor(Math.random() * 200);
	};
	return !bonusValue ? (Math.floor(Math.random() * 100)) : 100 + bonusValue;
};

const defaultEmbed = (message, bot) => new discord.MessageEmbed()
	.setColor("#49a013")
	.setFooter(`En reponse à ${message.author.tag} | ${command.syntax}`)
	.setAuthor(bot.user.username, "https://media.discordapp.net/attachments/749765499998437489/823241819801780254/36fb6d778b4d4a108ddcdefb964b3cc0.webp")
	.setTimestamp();

const setupMessage = (messageInfo) => {

	let { message, bot } = messageInfo;

	function mention(text) {
		return (text.includes(`<@${message.author.id}>`) === true) ?
			"" : `${message.author}\n`;
	};

	message.answer = (text, files) => {
		message.channel.send(`${mention(text)}${text}`, files || {});
	};

	message.embed = (text, files = []) => {
		return message.channel.send(
			defaultEmbed(message, bot, command)
				.setDescription(text)
				.attachFiles(files)
		);
	};

	message.returnEmbed = (text, files = []) => {
		return defaultEmbed(message, bot, command)
			.setDescription(text)
			.attachFiles(files)
	};

	message.customEmbed = (config, files = []) => {
		let embed = defaultEmbed(message, bot, command)
			.attachFiles(files);

		let newEmbed = config(embed);

		return message.channel.send(newEmbed);
	};

	message.returnCustomEmbed = (config, files = []) => {
		let embed = defaultEmbed(message, bot, command)
			.attachFiles(files);

		let newEmbed = config(embed);

		return newEmbed;
	};

	message.simple = text => {
		message.channel.send(text);
	};
}

module.exports = { randomItem, randomNumber, randomPercentage, defaultEmbed, setupMessage };