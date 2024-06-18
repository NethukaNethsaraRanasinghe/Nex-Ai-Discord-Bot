const { Client, Intents, MessageEmbed } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
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
const eightBallResponses = ["Yes", "I don't know", "Negative", "Don't", "Yahhh", "Hmm"];

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
    default:
      await message.channel.send('Unknown command. Type !help for a list of available commands.');
  }
});

async function handleHelpCommand(message, args) {
  const isAdmin = message.member.permissions.has('KICK_MEMBERS') || message.member.roles.cache.some(role => role.name.toLowerCase() === 'admin');

  if (args[0] === 'moderation') {
    const embed = new MessageEmbed()
      .setTitle('Moderation Commands')
      .setDescription('Here are the available moderation commands:')
      .addField('!timeout', 'Timeout a user.')
      .addField('!untimeout', 'Remove timeout from a user.')
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
  const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
  const userId = message.author.id;
  economy.set(userId, { job: randomJob, balance: economy.get(userId)?.balance || 0 });
  await message.channel.send(`Your job is: ${randomJob}. Type !work to earn money.`);
}

async function handleWorkCommand(message) {
  const userId = message.author.id;
  const userData = economy.get(userId);
  if (!userData || !userData.job) {
    await message.channel.send('You need to get a job first using !job.');
    return;
  }

  const earnings = jobEarnings[userData.job];
  const multiplier = userMultipliers.get(userId) || 1;
  const totalEarnings = earnings * multiplier;

  userData.balance += totalEarnings;
  economy.set(userId, userData);
  await message.channel.send(`You earned ${totalEarnings} ecomoney from your job as a ${userData.job}.`);
}

async function handleBalanceCommand(message) {
  const userId = message.author.id;
  const balance = economy.get(userId)?.balance || 0;
  await message.channel.send(`Your balance is: ${balance} ecomoney.`);
}

async function handleShopCommand(message, args) {
  const userId = message.author.id;
  const embed = new MessageEmbed()
    .setTitle('Shop')
    .setDescription('Here are the items you can buy:')
    .addField('Money 2x', 'Price: 200 ecomoney')
    .addField('Money 3x', 'Price: 500 ecomoney')
    .addField('Money 4x', 'Price: 2000 ecomoney')
    .setColor('#00ff00');
  await message.channel.send({ embeds: [embed] });

  if (args[0]) {
    const itemName = args.join(' ').toLowerCase();
    const item = shopItems.find(i => i.name.toLowerCase() === itemName);
    if (item) {
      const userBalance = economy.get(userId)?.balance || 0;
      if (userBalance >= item.price) {
        economy.get(userId).balance -= item.price;
        userMultipliers.set(userId, item.multiplier);
        await message.channel.send(`You have purchased ${item.name}. Your earnings multiplier is now ${item.multiplier}x.`);
      } else {
        await message.channel.send('You do not have enough ecomoney to purchase this item.');
      }
    } else {
      await message.channel.send('Item not found in shop.');
    }
  }
}

async function handleTimeoutCommand(message, args) {
  const userId = message.mentions.users.first()?.id;
  if (!userId) {
    await message.channel.send('Please mention a user to timeout.');
    return;
  }

  const user = message.guild.members.cache.get(userId);
  if (!user) {
    await message.channel.send('User not found.');
    return;
  }

  mutedUsers.add(userId);
  await message.channel.send(`${user.user.tag} has been timed out.`);
}

async function handleUnTimeoutCommand(message, args) {
  const userId = message.mentions.users.first()?.id;
  if (!userId) {
    await message.channel.send('Please mention a user to untimeout.');
    return;
  }

  const user = message.guild.members.cache.get(userId);
  if (!user) {
    await message.channel.send('User not found.');
    return;
  }

  mutedUsers.delete(userId);
  await message.channel.send(`${user.user.tag} has been un-timed out.`);
}

async function handle8BallCommand(message, args) {
  if (args.length === 0) {
    await message.channel.send('Please ask a question.');
    return;
  }

  const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
  await message.channel.send(response);
}

async function handleTicketCreateCommand(message) {
  const ticketCategory = message.guild.channels.cache.find(c => c.name === 'tickets' && c.type === 'category');
  if (!ticketCategory) {
    await message.guild.channels.create('tickets', { type: 'category' });
  }

  const ticketChannel = await message.guild.channels.create(`ticket-${message.author.username}`, {
    type: 'text',
    parent: ticketCategory.id,
    permissionOverwrites: [
      {
        id: message.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      },
      {
        id: message.author.id,
        allow: ['VIEW_CHANNEL'],
      },
    ],
  });

  await message.channel.send(`Ticket created: ${ticketChannel}`);
}

async function handlePurgeCommand(message, args) {
  if (!message.member.permissions.has('MANAGE_MESSAGES')) {
    await message.channel.send('You do not have permission to use this command.');
    return;
  }

  const deleteCount = parseInt(args[0], 10);
  if (!deleteCount || deleteCount < 1 || deleteCount > 100) {
    await message.channel.send('Please provide a number between 1 and 100.');
    return;
  }

  await message.channel.bulkDelete(deleteCount, true);
  await message.channel.send(`${deleteCount} messages deleted.`);
}

async function handleLockCommand(message) {
  if (!message.member.permissions.has('MANAGE_CHANNELS')) {
    await message.channel.send('You do not have permission to use this command.');
    return;
  }

  await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SEND_MESSAGES: false });
  await message.channel.send('Channel locked.');
}

async function handleUnlockCommand(message) {
  if (!message.member.permissions.has('MANAGE_CHANNELS')) {
    await message.channel.send('You do not have permission to use this command.');
    return;
  }

  await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SEND_MESSAGES: true });
  await message.channel.send('Channel unlocked.');
}

async function handleKickCommand(message, args) {
  if (!message.member.permissions.has('KICK_MEMBERS')) {
    await message.channel.send('You do not have permission to use this command.');
    return;
  }

  const userId = message.mentions.users.first()?.id;
  if (!userId) {
    await message.channel.send('Please mention a user to kick.');
    return;
  }

  const user = message.guild.members.cache.get(userId);
  if (!user) {
    await message.channel.send('User not found.');
    return;
  }

  const reason = args.slice(1).join(' ') || 'No reason provided';
  await user.kick(reason);
  await message.channel.send(`${user.user.tag} has been kicked. Reason: ${reason}`);
}

async function handleBanCommand(message, args) {
  if (!message.member.permissions.has('BAN_MEMBERS')) {
    await message.channel.send('You do not have permission to use this command.');
    return;
  }

  const userId = message.mentions.users.first()?.id;
  if (!userId) {
    await message.channel.send('Please mention a user to ban.');
    return;
  }

  const user = message.guild.members.cache.get(userId);
  if (!user) {
    await message.channel.send('User not found.');
    return;
  }

  const reason = args.slice(1).join(' ') || 'No reason provided';
  await user.ban({ reason });
  await message.channel.send(`${user.user.tag} has been banned. Reason: ${reason}`);
}

async function handleUserCommand(message, args) {
  const userId = args[0]?.replace(/<@!?(\d+)>/, '$1') || message.author.id;
  const user = message.guild.members.cache.get(userId) || await message.guild.members.fetch(userId);
  if (!user) {
    await message.channel.send('User not found.');
    return;
  }

  const embed = new MessageEmbed()
    .setTitle(`${user.user.tag} (${user.user.id})`)
    .setThumbnail(user.user.displayAvatarURL())
    .addField('Joined Server', user.joinedAt.toDateString(), true)
    .addField('Account Created', user.user.createdAt.toDateString(), true)
    .setColor('#0000ff');
  await message.channel.send({ embeds: [embed] });
}

async function handleTranslateCommand(message, args) {
  if (args.length < 2) {
    await message.channel.send('Please provide the word to translate and the target language code (e.g., !translate hello es).');
    return;
  }

  const [word, targetLanguage] = args;
  try {
    const response = await axios.get(`https://api.mymemory.translated.net/get?q=${word}&langpair=en|${targetLanguage}`);
    const translatedText = response.data.responseData.translatedText;
    await message.channel.send(`Translation: ${translatedText}`);
  } catch (error) {
    console.error('Error translating word:', error);
    await message.channel.send('Sorry, I couldn\'t translate the word at the moment.');
  }
}

function getRandomPrompt() {
  const prompts = [
    'Tell me something interesting.',
    'What do you think about the weather today?',
    'Can you share a fun fact?',
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}

async function generateAiResponse(userMessage) {
  const response = await axios.post(
    OPENAI_API_URL,
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.5,
    },
    { headers: { Authorization: `Bearer ${OPENAI_API_KEY}` } }
  );

  return response.data.choices[0].message.content;
}

client.login(process.env.TOKEN);
