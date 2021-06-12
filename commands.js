const fetch = require("node-fetch");

const config = require("./config.json");
const utils = require("./utils");
let { addSong, startMusic, stopMusic, skipSong } = require("./music");

const commands = new Map();

class Command {
	constructor(name, command) {
		this.name = name;
		this.description = command.description;
		this.syntax = `${config.prefix}${command.syntax}`;
		this.execute = command.execute || (() => { });
		this.hidden = command.hidden || false;
		commands.set(name, this);
	};
};

new Command("help", {
	description: "Donne une liste de toutes les commandes disponibles",
	syntax: `help`,
	execute: args => {
		let { message } = args;

		function cutArray(array) {
			let newArray = new Array();
			do {
				let items = array.splice(0, 5);
				newArray.push(items);
			} while (array.length >= 5);
			if (array.length !== 0) newArray.push(array);
			return newArray;
		};

		let commandArray = new Array();
		commands.forEach((command) => commandArray.push(command));

		let formatted = cutArray(commandArray);
		let index = 0;

		let loadPage = (embed) => {
			embed.addField(`Page: `, `${index + 1}/${formatted.length}`, true);
			formatted[index].forEach((command) => {
				if (command.hidden === true) return;
				embed.addField(`${command.syntax}`, `${command.description}`);
			});
			return embed;
		};

		message.customEmbed(loadPage)
			.then(async (sent) => {
				await sent.react("⬅️");
				await sent.react("➡️");
				await sent.react("❌");
				let collector = sent.createReactionCollector((reaction) => ["⬅️", "➡️", "❌"].includes(reaction.emoji.name), { max: 200, time: 60000, errors: ["time"] });
				collector.on("collect", async (reaction, user) => {
					if (reaction.emoji.name === "➡️" && index + 1 !== formatted.length) {
						index++;
						await reaction.users.remove(user);
						await sent.edit(message.returnCustomEmbed(loadPage));
					} else if (reaction.emoji.name === "⬅️" && index !== 0) {
						index--;
						await reaction.users.remove(user);
						await sent.edit(message.returnCustomEmbed(loadPage));
					} else if (reaction.emoji.name === "❌") {
						return collector.stop("L'affichage a été fermé");
					} else {
						await reaction.users.remove(user);
					};
				});
				collector.on("end", async (collected, reason) => {
					console.log(reason);
					if (reason === "time") await sent.edit(message.returnEmbed(`Delai maximum d'affichage dépassé (1min)`));
					else await sent.edit(message.returnEmbed(reason));
					await sent.reactions.removeAll();
				});
			}).catch(err => console.log(err));
	}
});

new Command("hey", {
	description: "Dire bonjour au bot",
	syntax: `hey`,
	execute: args => {
		let { message } = args;
		message.embed(`${utils.randomItem("hey", "Salut", "Yo")} ${message.author} ${utils.randomItem(":3", ":)", "!")}`);
	}
});

new Command("epeler", {
	description: "Dire bonjour au bot",
	syntax: `epeler <mot/phrase>`,
	execute: async args => {
		let { message, content } = args;
		let length = content.length;
		for (let i = 0; i < length; i++) {
			await message.simple(content.charAt(i));
		};
	}
});

new Command("vrai ou faux", {
	description: "Réponds \"vrai\" ou \"faux\" aléatoirement",
	syntax: `vrai ou faux <?phrase>`,
	execute: args => {
		let { message, content, bot } = args;
		message.embed(`${content && `${message.author}\n${content}\n${bot.user}\n`}${utils.randomItem("vrai !", "faux !")}`)
	}
});

new Command("taux", {
	description: "Donne un taux aléatoire de quelque chose",
	syntax: `taux <?phrase>`,
	execute: args => {
		let { message, content, bot } = args;
		message.embed(`${content && `${message.author}\n${content}\n${bot.user}\n`}${utils.randomPercentage()}%`);
	}
});

new Command("choose", {
	description: "Choisi une personne aléatoire dans le serveur",
	syntax: `choose <?phrase>`,
	execute: args => {
		let { message, content, bot } = args;
		message.guild.members.fetch()
			.then(members => {
				message.embed(`${content && `${message.author}\n${content}\n${bot.user}\nLa personne choisie est ${members.random()}`}`);
			});
	}
});

new Command("hug", {
	description: "Hug somebody",
	syntax: `hug <?mention>`,
	execute: args => {
		let { message } = args;
		let mentions = message.mentions.users.array();
		if (mentions.length === 0) mentions = [message.author];
		fetch("https://nekos.life/api/hug")
			.then(res => res.json())
			.then(data => {
				console.log(data);
				message.customEmbed(embed => embed
					.setDescription(`${message.author} hugs ${mentions.length === 1 ? "herself/himself" : `${mentions.map((user, i) => (i === 0) ? `${user}` : `, ${user}`).join("")}`}`)
					.setImage(data.url)
				);
			});

	}
});

new Command("pdp", {
	description: "Obtenir la photo de profil d'un membre du serveur",
	syntax: `pdp <?mention>`,
	execute: args => {
		let { message } = args;
		let mentions = message.mentions.users.array();
		if (mentions.length === 0) mentions = [message.author];
		message.embed(`Voici ${(mentions.length === 1) ? "la photo de profil" : "les photos de profil"} de ${mentions.map((user, i) => (i === 0) ? `${user}` : `, ${user}`).join("")}`, mentions.map(user => user.displayAvatarURL()));
	}
});

new Command("music add", {
	description: "Ajouter une musique à la playlist",
	syntax: `music add <url youtube>`,
	execute: args => addSong(args)
});

new Command("music play", {
	description: "Jouer la playlist",
	syntax: `music play`,
	execute: args => startMusic(args)
});

new Command("music stop", {
	description: "Arreter la musique",
	syntax: `music stop`,
	execute: args => stopMusic(args)
});

new Command("music skip", {
	description: "Passer cette musique",
	syntax: `music skip`,
	execute: args => skipSong(args)
});

new Command("code", {
	description: "Voire le code du bot (github)",
	syntax: `code`,
	execute: args => {
		let { message } = args;
		message.customEmbed(embed => {
			embed.setDescription(`Voici le lien pour voir le code qui me fait fonctionner ${utils.randomItem(":3", ":)", "!")}`);
			embed.setTitle("voir le code");
			embed.setURL(require("./package.json").repository.url);
			return embed;
		});
	}
});

new Command("invite", {
	description: "Génére un lien pour inviter le bot dans un de vos serveur",
	syntax: `invite`,
	execute: args => {
		let { message, bot } = args;
		bot.generateInvite({ permissions: "ADMINISTRATOR" })
			.then(link => message.customEmbed((embed) =>
				embed
					.setDescription(`Voici un lien pour m'inviter dans votre serveur`)
					.setTitle("inviter")
					.setURL(link)
			))

	}
});

new Command("emote send", {
	description: `Le bot envoie une emote à l'aide un id d'emote`,
	syntax: `emote send <id d'emote>`,
	execute: async (args) => {
		let { message, content, bot } = args;

		let splited = content.split(" ");

		let emote = await bot.emojis.cache.get(splited[0]);

		message.simple(`<${emote.animated ? "a" : ""}:${emote.name}:${emote.id}>`);

	}
});

new Command("emote react", {
	description: `Fait réagir le bot avec un id d'emote et un id de message`,
	syntax: `emote react <id de message> <id d'emote>`,
	execute: (args) => {
		let { message, content } = args;

		let splited = content.split(" ");

		message.channel.messages.fetch(splited[0])
			.then(fetched => {
				message.delete();
				fetched.react(splited[1]);
			});

	}
});

new Command("emote spam", {
	description: `Le bot envoie toutes les emotes de sa connaissance`,
	syntax: `emote spam`,
	execute: async (args) => {
		let { message, bot } = args;

		let emotes = await bot.emojis.cache;

		emotes.forEach((emote) => {
			message.simple(`<${emote.animated ? "a" : ""}:${emote.name}:${emote.id}>`);
		});

	}
});

/*

new Command("testmodify", {
	description: "la flemme vous connaissez ?",
	execute: args => {
		let { message } = args;

		message.customEmbed(embed => {
			embed.setDescription(`hey je vais changer dans 5 secondes`);
			return embed;
		}).then((message, embed) => {
			setTimeout(() => {
				embed.setDescription(`ça y est`);
				message.edit(embed);
			}, 5000);
		});
	}
});

new Command("detectreaction", {
	description: "lorsque la reaction est ajoutée le message change",
	execute: args => {
		let { message } = args;

		message.customEmbed(embed => {
			embed.setDescription(`reagi avec :white_check_mark: et je changerai :)`);
			return embed;
		}).then((sent, embed, requirer) => {
			sent.awaitReactions((reaction, user) => ["✅"].includes(reaction.emoji.name) && user.id === requirer.id, { max: 1, time: 30000, errors: ["time"] })
				.then(collected => {
					let reaction = collected.first();
					if (reaction.emoji.name === "✅") {
						embed.setDescription(`tu as ajouté la reaction :)`);
						sent.edit(embed);
					};
				}).catch(() => {
					embed.setDescription(`Delai maximum de réaction dépassé (30s)`);
					sent.edit(embed);
				});
		});
	}
});

*/

module.exports.listen = (messageInfo) => {
	let { message, bot } = messageInfo,
		content = message.content;

	let commandName;
	commands.forEach((value, key) => {
		if (content.match(new RegExp(`^${config.prefix}${key}`, "g"))) commandName = key;
	});

	if (content.match(new RegExp(`^${config.prefix}`, "g"))) {
		if (commandName && commands.has(commandName)) commands.get(commandName).execute({
			message,
			content: message.content.replace(new RegExp(`^${config.prefix}${commandName}`, "g"), "").trim(),
			bot
		}); else message.react("❔");
	};

};