const fs = require('fs');

const Discord = require('discord.js');
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMembers,
        Discord.GatewayIntentBits.GuildMessageReactions
    ]
});
const config = require('./config.json');
client.config = config;

const synchronizeSlashCommands = require('discord-sync-commands');

// Init discord giveaways
const { GiveawaysManager } = require('givify');

client.giveawaysManager = new GiveawaysManager(client, {
    storage: './giveaways.json',
    default: {
        botsCanWin: false,
        embedColor: '#FF0000',
        reaction: '🎉',
        lastChance: {
            enabled: true,
            content: '⚠️ **LAST CHANCE TO ENTER !** ⚠️',
            threshold: 10000,
            embedColor: '#FF0000'
        }
    }
});
// We now have a client.giveawaysManager property to manage our giveaways!

client.giveawaysManager.on('giveawayReactionAdded', (giveaway, member, reaction) => {
    console.log(`${member.user.tag} entered giveaway #${giveaway.messageId} (${reaction.emoji.name})`);
});

client.giveawaysManager.on('giveawayReactionRemoved', (giveaway, member, reaction) => {
    console.log(`${member.user.tag} unreact to giveaway #${giveaway.messageId} (${reaction.emoji.name})`);
});

client.giveawaysManager.on('giveawayEnded', (giveaway, winners) => {
    console.log(
        `Giveaway #${giveaway.messageId} ended! Winners: ${winners.map((member) => member.user.username).join(', ')}`
    );
});
client.giveawaysManager.on('giveawayMemberJoined', (giveaway, member, interaction) => {
    interaction.reply({
        content: `${member.user.username} joined the giveaway!`
    });
    giveaway.entrantIds.push(interaction.member.id);
});
client.giveawaysManager.on('giveawayMemberTryLeft', (giveaway, member, interaction) => {
    interaction.reply({
        content: `giveawayMemberTryLeft`
    });
});
client.giveawaysManager.on('giveawayMemberAlreadyJoined', async (giveaway, member, interaction) => {
    // send a ephemral reply asking him he wants to leave the giveaway
    const question = await interaction.reply({
        content: 'You have already joined this giveaway. Do you want to leave it?',
        ephemeral: true,
        components: [
            new Discord.ActionRowBuilder().addComponents(
                new Discord.ButtonBuilder().setCustomId('leave').setLabel('Leave').setStyle(Discord.ButtonStyle.Danger)
            )
        ]
    });
    const filter = (i) => i.user.id === member.user.id;
    const collecter = await question.createMessageComponentCollector({ filter, time: 30000 });
    collecter.on('collect', async (i) => {
         // remove the member from the entrantIds
    const index = giveaway.entrantIds.indexOf(member.id);
    if (index !== -1) {
        giveaway.entrantIds.splice(index, 1);
    }
    //tell him we have removed him
    await i.reply({
        content: 'You have left the giveaway.'
    })
    })
    collecter.on('end', async (collected, reason) => {
        if (reason === 'time') {
            await question.delete();
        }
    });
});

/* Load all commands */
client.commands = new Discord.Collection();
fs.readdir(`./commands/`, (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith('.js')) return;
        let props = require(`./commands/${file}`);
        let commandName = file.split('.')[0];
        client.commands.set(commandName, {
            name: commandName,
            ...props
        });
        console.log(`👌 Command loaded: ${commandName}`);
    });
    synchronizeSlashCommands(
        client,
        client.commands.map((c) => ({
            name: c.name,
            description: c.description,
            options: c.options,
            type: Discord.ApplicationCommandType.ChatInput
        })),
        {
            debug: true,
            guildId: config.guildId
        }
    );
});

/* Load all events */
fs.readdir(`./events/`, (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith('.js')) return;
        const event = require(`./events/${file}`);
        let eventName = file.split('.')[0];
        console.log(`👌 Event loaded: ${eventName}`);
        client.on(eventName, event.bind(null, client));
        delete require.cache[require.resolve(`./events/${file}`)];
    });
});

// Login
client.login(config.token);
