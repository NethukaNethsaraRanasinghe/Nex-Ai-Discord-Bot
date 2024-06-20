require('dotenv').config();
const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
client.commands = new Collection();

const PREFIX = '!';
const OPENAI_API_URL = 'https://heckerai.uk.to/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const messageHistory = new Map();

// Command handler - Load all commands from the 'commands' folder
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    if (commandName === 'talk') {
      await command.execute(message, args, messageHistory);
    } else {
      await command.execute(message, args);
    }
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});

client.on('guildMemberAdd', async member => {
  try {
    const rolesData = JSON.parse(fs.readFileSync('./autoroles.json', 'utf-8'));
    console.log('Assigning roles to new member:', member.user.tag);

    for (const roleId of rolesData.roles) {
      try {
        const role = await member.guild.roles.fetch(roleId);
        if (role) {
          await member.roles.add(role);
          console.log(`Role ${role.name} added to ${member.user.tag}`);
        } else {
          console.warn(`Role ID ${roleId} not found`);
        }
      } catch (error) {
        console.error(`Error adding role ${roleId} to member ${member.user.tag}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading autoroles.json:', error);
  }
});

client.login(process.env.DISCORD_TOKEN);
