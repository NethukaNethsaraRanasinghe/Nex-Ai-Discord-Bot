const { Client, Intents, MessageEmbed, Permissions } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILD_VOICE_STATES] });
const PREFIX = '!';
const restrictedWords = process.env.RESTRICTED_WORDS.split(',');
const OPENAI_API_URL = 'https://heckerai.uk.to/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const economy = new Map();
const jobs = ['Developer', 'Designer', 'Teacher', 'Doctor', 'Chef', 'Artist', 'Engineer', 'Writer'];
const jobEarnings = {
  'Developer': 100,
  'Designer': 80,
  'Teacher': 70,
  'Doctor': 150,
  'Chef': 60,
  'Artist': 50,
  'Engineer': 90,
  'Writer': 75
};

const shopItems = [
  { name: 'Money 2x', price: 200, multiplier: 2 },
  { name: 'Money 3x', price: 500, multiplier: 3 },
  { name: 'Money 4x', price: 2000, multiplier: 4 },
];

const userMultipliers = new Map();
const mutedUsers = new Set();
const warnedUsers = new Map(); // Store warnings for users
const eightBallResponses = ["Yes", "I don't know", "Negative", "Don't", "Yahhh", "Hmm"];

const audioPlayer = createAudioPlayer();

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Check for muted users and delete their messages
  if (mutedUsers.has(message.author.id)) {
    await message.delete();
    return;
  }

  // Check for restricted words
  if (restrictedWords.some(word => message.content.includes(word))) {
    if (message.deletable) {
      await message.delete();
      await message.channel.send('Your message contained a restricted word and was deleted.');
    } else {
      console.warn('Cannot delete message: insufficient permissions.');
    }
    return;
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'help':
      await handleHelpCommand(message, args);
      break;
    case 'joke':
      await handleJokeCommand(message);
      break;
    case 'talk':
      await handleTalkCommand(message, args);
      break;
    case 'ping':
      await handlePingCommand(message);
      break;
    case 'job':
      await handleJobCommand(message);
      break;
    case 'work':
      await handleWorkCommand(message);
      break;
    case 'balance':
      await handleBalanceCommand(message);
      break;
    case 'shop':
      await handleShopCommand(message, args);
      break;
    case 'buy':
      await handleBuyCommand(message, args);
      break;
    case 'timeout':
      await handleTimeoutCommand(message, args);
      break;
    case 'untimeout':
      await handleUnTimeoutCommand(message, args);
      break;
    case '8ball':
      await handle8BallCommand(message, args);
      break;
    case 'ticketcreate':
      await handleTicketCreateCommand(message);
      break;
    case 'purge':
      await handlePurgeCommand(message, args);
      break;
    case 'lock':
      await handleLockCommand(message);
      break;
    case 'unlock':
      await handleUnlockCommand(message);
      break;
    case 'kick':
      await handleKickCommand(message, args);
      break;
    case 'ban':
      await handleBanCommand(message, args);
      break;
    case 'user':
      await handleUserCommand(message, args);
      break;
    case 'translate':
      await handleTranslateCommand(message, args);
      break;
    case 'warn':
      await handleWarnCommand(message, args);
      break;
    case 'musicplay':
      await handleMusicPlayCommand(message, args);
      break;
    case 'musicstop':
      await handleMusicStopCommand(message);
      break;
    case 'musicpause':
      await handleMusicPauseCommand(message);
      break;
    case 'musicresume':
      await handleMusicResumeCommand(message);
      break;
    default:
      await message.channel.send('Unknown command. Type !help for a list of available commands.');
  }
});

async function handleHelpCommand(message, args) {
  const isAdmin = message.member.permissions.has(Permissions.FLAGS.KICK_MEMBERS) || message.member.roles.cache.some(role => role.name.toLowerCase() === 'admin');

  if (args[0] === 'moderation') {
    const embed = new MessageEmbed()
      .setTitle('Moderation Commands')
      .setDescription('Here are the available moderation commands:')
      .addField('!timeout', 'Timeout a user.')
      .addField('!untimeout', 'Remove timeout from a user.')
      .addField('!warn', 'Warn a user.')
      .addField('!purge', 'Delete a specified number of messages.')
      .addField('!lock', 'Lock the current channel.')
      .addField('!unlock', 'Unlock the current channel.')
      .addField('!kick', 'Kick a user with a reason.')
      .addField('!ban', 'Ban a user with a reason.')
      .setColor('#ff0000');
    await message.channel.send({ embeds: [embed] });
  } else if (args[0] === 'fun') {
    const embed = new MessageEmbed()
      .setTitle('Fun Commands')
      .setDescription('Here are the available fun commands:')
      .addField('!joke', 'Tell a random joke.')
      .addField('!8ball', 'Ask the magic 8 ball a question.')
      .setColor('#00ff00');
    await message.channel.send({ embeds: [embed] });
  } else if (args[0] === 'information') {
    const embed = new MessageEmbed()
      .setTitle('Information Commands')
      .setDescription('Here are the available information commands:')
      .addField('!help', 'Show available commands.')
      .addField('!talk', 'Chat with the bot.')
      .addField('!ping', 'Check bot ping.')
      .addField('!job', 'Get a random job.')
      .addField('!work', 'Earn money from your job.')
      .addField('!balance', 'Check your balance.')
      .addField('!user', 'Get information about a user.')
      .addField('!shop', 'View and buy items from the shop.')
      .addField('!translate', 'Translate a word to another language.')
      .setColor('#0000ff');
    await message.channel.send({ embeds: [embed] });
  } else {
    const embed = new MessageEmbed()
      .setTitle('Available Commands')
      .setDescription('Use !help <category> to see commands in that category.')
      .addField('Moderation', 'Use !help moderation to see commands in this category.')
      .addField('Fun', 'Use !help fun to see commands in this category.')
      .addField('Information', 'Use !help information to see commands in this category.')
      .setColor('#ffffff');
    await message.channel.send({ embeds: [embed] });
  }
}

async function handleJokeCommand(message) {
  try {
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
    await message.channel.send(`${response.data.setup} - ${response.data.punchline}`);
  } catch (error) {
    console.error('Error fetching joke:', error);
    await message.channel.send('Sorry, I couldn\'t fetch a joke for you at the moment.');
  }
}

async function handleTalkCommand(message, args) {
  const userMessage = args.join(' ') || getRandomPrompt();
  try {
    const aiResponse = await generateAiResponse(userMessage);
    await message.channel.send(aiResponse);
  } catch (error) {
    console.error('Error generating AI response:', error);
    await message.channel.send('Sorry, I couldn\'t generate a response at the moment.');
  }
}

async function handlePingCommand(message) {
  const ping = Date.now() - message.createdTimestamp;
  await message.channel.send(`Pong! Bot ping is ${ping}ms.`);
}

async function handleJobCommand(message) {
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  await message.channel.send(`Your job is: ${job}`);
}

async function handleWorkCommand(message) {
  const userId = message.author.id;
  const job = jobs[Math.floor(Math.random() * jobs.length)];
  const earnings = jobEarnings[job];
  const multiplier = userMultipliers.get(userId) || 1;
  const totalEarnings = earnings * multiplier;

  if (!economy.has(userId)) {
    economy.set(userId, 0);
  }
  const balance = economy.get(userId) + totalEarnings;
  economy.set(userId, balance);

  await message.channel.send(`You worked as a ${job} and earned $${totalEarnings}. Your new balance is $${balance}.`);
}

async function handleBalanceCommand(message) {
  const userId = message.author.id;
  const balance = economy.get(userId) || 0;
  await message.channel.send(`Your balance is $${balance}.`);
}

async function handleShopCommand(message, args) {
  const embed = new MessageEmbed()
    .setTitle('Shop')
    .setDescription('Available items for purchase:')
    .addField('Money 2x', '$200 - Doubles your earnings for one job.')
    .addField('Money 3x', '$500 - Triples your earnings for one job.')
    .addField('Money 4x', '$2000 - Quadruples your earnings for one job.')
    .setColor('#00ff00');
  await message.channel.send({ embeds: [embed] });
}

async function handleBuyCommand(message, args) {
  const userId = message.author.id;
  const itemName = args.join(' ').toLowerCase();

  const item = shopItems.find(i => i.name.toLowerCase() === itemName);

  if (!item) {
    await message.channel.send('Item not found. Use !shop to see available items.');
    return;
  }

  const userBalance = economy.get(userId) || 0;
  if (userBalance < item.price) {
    await message.channel.send(`You don't have enough money to buy ${item.name}. Your balance is $${userBalance}.`);
    return;
  }

  economy.set(userId, userBalance - item.price);
  userMultipliers.set(userId, item.multiplier);

  await message.channel.send(`You bought ${item.name} for $${item.price}. Your new balance is $${userBalance - item.price}.`);
}

async function handleTimeoutCommand(message, args) {
  const user = message.mentions.users.first();
  if (!user) {
    await message.channel.send('Please mention a user to timeout.');
    return;
  }

  const member = message.guild.members.cache.get(user.id);
  if (!member) {
    await message.channel.send('User not found.');
    return;
  }

  const timeoutRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === 'timeout');
  if (!timeoutRole) {
    await message.channel.send('Timeout role not found.');
    return;
  }

  try {
    await member.roles.add(timeoutRole);
    mutedUsers.add(user.id);
    await message.channel.send(`${user.username} has been timed out.`);
  } catch (error) {
    console.error('Error adding timeout role:', error);
    await message.channel.send('Failed to timeout user.');
  }
}

async function handleUnTimeoutCommand(message, args) {
  const user = message.mentions.users.first();
  if (!user) {
    await message.channel.send('Please mention a user to remove timeout.');
    return;
  }

  const member = message.guild.members.cache.get(user.id);
  if (!member) {
    await message.channel.send('User not found.');
    return;
  }

  const timeoutRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === 'timeout');
  if (!timeoutRole) {
    await message.channel.send('Timeout role not found.');
    return;
  }

  try {
    await member.roles.remove(timeoutRole);
    mutedUsers.delete(user.id);
    await message.channel.send(`${user.username} has been removed from timeout.`);
  } catch (error) {
    console.error('Error removing timeout role:', error);
    await message.channel.send('Failed to remove timeout from user.');
  }
}

async function handle8BallCommand(message, args) {
  const question = args.join(' ');
  if (!question) {
    await message.channel.send('Please ask a question.');
    return;
  }

  const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
  await message.channel.send(`🎱 ${response}`);
}

async function handleTicketCreateCommand(message) {
  try {
    const ticketChannel = await message.guild.channels.create(`ticket-${message.author.username}`, {
      type: 'GUILD_TEXT',
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: [Permissions.FLAGS.VIEW_CHANNEL],
        },
        {
          id: message.author.id,
          allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES],
        },
      ],
    });

    await ticketChannel.send(`Hello ${message.author}, a staff member will be with you shortly. Please describe your issue.`);
  } catch (error) {
    console.error('Error creating ticket:', error);
    await message.channel.send('Failed to create ticket.');
  }
}

async function handlePurgeCommand(message, args) {
  const amount = parseInt(args[0]);
  if (isNaN(amount) || amount < 1 || amount > 100) {
    await message.channel.send('Please enter a number between 1 and 100.');
    return;
  }

  try {
    await message.channel.bulkDelete(amount, true);
    await message.channel.send(`Deleted ${amount} messages.`).then(msg => {
      setTimeout(() => msg.delete(), 3000);
    });
  } catch (error) {
    console.error('Error deleting messages:', error);
    await message.channel.send('Failed to delete messages.');
  }
}

async function handleLockCommand(message) {
  try {
    await message.channel.permissionOverwrites.edit(message.guild.id, { SEND_MESSAGES: false });
    await message.channel.send('Channel has been locked.');
  } catch (error) {
    console.error('Error locking channel:', error);
    await message.channel.send('Failed to lock channel.');
  }
}

async function handleUnlockCommand(message) {
  try {
    await message.channel.permissionOverwrites.edit(message.guild.id, { SEND_MESSAGES: true });
    await message.channel.send('Channel has been unlocked.');
  } catch (error) {
    console.error('Error unlocking channel:', error);
    await message.channel.send('Failed to unlock channel.');
  }
}

async function handleKickCommand(message, args) {
  const user = message.mentions.users.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';

  if (!user) {
    await message.channel.send('Please mention a user to kick.');
    return;
  }

  const member = message.guild.members.cache.get(user.id);
  if (!member) {
    await message.channel.send('User not found.');
    return;
  }

  try {
    await member.kick(reason);
    await message.channel.send(`${user.username} has been kicked. Reason: ${reason}`);
  } catch (error) {
    console.error('Error kicking user:', error);
    await message.channel.send('Failed to kick user.');
  }
}

async function handleBanCommand(message, args) {
  const user = message.mentions.users.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';

  if (!user) {
    await message.channel.send('Please mention a user to ban.');
    return;
  }

  const member = message.guild.members.cache.get(user.id);
  if (!member) {
    await message.channel.send('User not found.');
    return;
  }

  try {
    await member.ban({ reason });
    await message.channel.send(`${user.username} has been banned. Reason: ${reason}`);
  } catch (error) {
    console.error('Error banning user:', error);
    await message.channel.send('Failed to ban user.');
  }
}

async function handleUserCommand(message, args) {
  const user = message.mentions.users.first() || message.author;
  const member = message.guild.members.cache.get(user.id);

  const embed = new MessageEmbed()
    .setTitle(`${user.username}'s Info`)
    .addField('ID', user.id)
    .addField('Joined Server', member.joinedAt.toDateString())
    .addField('Joined Discord', user.createdAt.toDateString())
    .setColor('#00ff00')
    .setThumbnail(user.displayAvatarURL());

  await message.channel.send({ embeds: [embed] });
}

async function handleTranslateCommand(message, args) {
  const word = args[0];
  const targetLang = args[1];

  if (!word || !targetLang) {
    await message.channel.send('Please provide a word and target language.');
    return;
  }

  try {
    const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/${targetLang}/${word}`);
    const translation = response.data[0].meanings[0].definitions[0].definition;
    await message.channel.send(`The translation of ${word} in ${targetLang} is: ${translation}`);
  } catch (error) {
    console.error('Error translating word:', error);
    await message.channel.send('Failed to translate word.');
  }
}

async function handleWarnCommand(message, args) {
  const user = message.mentions.users.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';

  if (!user) {
    await message.channel.send('Please mention a user to warn.');
    return;
  }

  try {
    if (!warns.has(user.id)) {
      warns.set(user.id, []);
    }
    warns.get(user.id).push(reason);
    await message.channel.send(`${user.username} has been warned. Reason: ${reason}`);
  } catch (error) {
    console.error('Error warning user:', error);
    await message.channel.send('Failed to warn user.');
  }
}

async function handleWarnsCommand(message, args) {
  const user = message.mentions.users.first() || message.author;

  if (!warns.has(user.id)) {
    await message.channel.send(`${user.username} has no warnings.`);
    return;
  }

  const userWarns = warns.get(user.id);
  const embed = new MessageEmbed()
    .setTitle(`${user.username}'s Warnings`)
    .setDescription(userWarns.map((warn, index) => `${index + 1}. ${warn}`).join('\n'))
    .setColor('#ff0000');

  await message.channel.send({ embeds: [embed] });
}

async function handleClearWarnsCommand(message, args) {
  const user = message.mentions.users.first();

  if (!user) {
    await message.channel.send('Please mention a user to clear warnings.');
    return;
  }

  try {
    warns.delete(user.id);
    await message.channel.send(`${user.username}'s warnings have been cleared.`);
  } catch (error) {
    console.error('Error clearing warnings:', error);
    await message.channel.send('Failed to clear warnings.');
  }
}

client.login(process.env.TOKEN);
