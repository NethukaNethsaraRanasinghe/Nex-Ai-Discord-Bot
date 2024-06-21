require('dotenv').config();
const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const { CooldownManager } = require('discord.js-commando');
const pool = require('./database');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
client.commands = new Collection();
const cooldownManager = new CooldownManager();

const PREFIX = '!';

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
  if (message.author.bot || !message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  try {
    if (command.cooldown && cooldownManager.has(message.author.id, command.name)) {
      return message.reply(`You can use this command again in ${cooldownManager.remainingTime(message.author.id, command.name).toFixed(1)} seconds.`);
    }

    await command.execute(message, args);

    if (command.cooldown) {
      cooldownManager.set(message.author.id, command.name, command.cooldown * 1000);
    }
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});

// Discord guild member add event (for auto role assignment if needed)
client.on('guildMemberAdd', async member => {
  // Your existing auto role assignment logic if required
  // Example: Assigning roles to new members based on a JSON file
  // Remove or modify this according to your actual logic
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
