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
  userData.balance += earnings;
  economy.set(userId, userData);
  await message.channel.send(`You earned ${earnings} ecomoney from your job as a ${userData.job}.`);
}

async function handleBalanceCommand(message) {
  const userId = message.author.id;
  const balance = economy.get(userId)?.balance || 0;
  await message.channel.send(`Your balance is: ${balance} ecomoney.`);
}

async function handleTimeoutCommand(message, args) {
  const userToTimeout = message.mentions.members.first();
  if (!userToTimeout) {
    await message.channel.send('Please mention a user to timeout.');
    return;
  }

  mutedUsers.add(userToTimeout.id);
  await message.delete();
  await message.channel.send(`${userToTimeout.user.tag} has been timed out.`);
}

async function handleUnTimeoutCommand(message, args) {
  const userToUnTimeout = message.mentions.members.first();
  if (!userToUnTimeout) {
    await message.channel.send('Please mention a user to untimeout.');
    return;
  }

  mutedUsers.delete(userToUnTimeout.id);
  await message.channel.send(`${userToUnTimeout.user.tag} has been un-timed out.`);
}

async function handle8BallCommand(message, args) {
  const question = args.join(' ');
  if (!question) {
    await message.channel.send('Please ask a question.');
    return;
  }

  const response = eightBallResponses[Math.floor(Math.random() * eightBallResponses.length)];
  await message.channel.send(response);
}

async function handleTicketCreateCommand(message) {
  const channelName = `ticket-${Math.floor(Math.random() * 10000)}`;
  const guild = message.guild;

  try {
    const channel = await guild.channels.create(channelName, {
      type: 'GUILD_TEXT',
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: ['VIEW_CHANNEL']
        },
        {
          id: message.author.id,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
        }
      ]
    });
    await message.channel.send(`Ticket created: ${channelName}`);
  } catch (error) {
    console.error('Error creating ticket channel:', error);
    await message.channel.send('Sorry, I couldn\'t create the ticket channel at the moment.');
  }
}

async function handlePurgeCommand(message, args) {
  const amount = parseInt(args[0]);
  if (isNaN(amount) || amount < 1 || amount > 100) {
    await message.channel.send('Please provide a number between 1 and 100.');
    return;
  }

  try {
    await message.channel.bulkDelete(amount, true);
    await message.channel.send(`Deleted ${amount} messages.`).then(msg => {
      setTimeout(() => msg.delete(), 5000);
    });
  } catch (error) {
    console.error('Error deleting messages:', error);
    await message.channel.send('Sorry, I couldn\'t delete the messages at the moment.');
  }
}

async function handleLockCommand(message) {
  try {
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SEND_MESSAGES: false, VIEW_CHANNEL: false });
    await message.channel.send('Channel locked for everyone.');
  } catch (error) {
    console.error('Error locking channel:', error);
    await message.channel.send('Sorry, I couldn\'t lock the channel at the moment.');
  }
}

async function handleUnlockCommand(message) {
  try {
    await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SEND_MESSAGES: true, VIEW_CHANNEL: true });
    await message.channel.send('Channel unlocked for everyone.');
  } catch (error) {
    console.error('Error unlocking channel:', error);
    await message.channel.send('Sorry, I couldn\'t unlock the channel at the moment.');
  }
}

async function handleKickCommand(message, args) {
  const userToKick = message.mentions.members.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';
  if (!userToKick) {
    await message.channel.send('Please mention a user to kick.');
    return;
  }

  try {
    await userToKick.kick(reason);
    await message.channel.send(`${userToKick.user.tag} has been kicked. Reason: ${reason}`);
  } catch (error) {
    console.error('Error kicking user:', error);
    await message.channel.send('Sorry, I couldn\'t kick the user at the moment.');
  }
}

async function handleBanCommand(message, args) {
  const userToBan = message.mentions.members.first();
  const reason = args.slice(1).join(' ') || 'No reason provided';
  if (!userToBan) {
    await message.channel.send('Please mention a user to ban.');
    return;
  }

  try {
    await userToBan.ban({ reason });
    await message.channel.send(`${userToBan.user.tag} has been banned. Reason: ${reason}`);
  } catch (error) {
    console.error('Error banning user:', error);
    await message.channel.send('Sorry, I couldn\'t ban the user at the moment.');
  }
}

async function handleUserCommand(message, args) {
  const user = message.mentions.users.first() || message.author;

  const embed = new MessageEmbed()
    .setTitle(`${user.username}'s Information`)
    .setThumbnail(user.displayAvatarURL())
    .addField('Username', user.username)
    .addField('ID', user.id)
    .setColor('#00ff00');

  await message.channel.send({ embeds: [embed] });
}

function getJobForUser(userId) {
  // Simulate random job assignment for the user
  return jobs[Math.floor(Math.random() * jobs.length)];
}

function addToBalance(userId, amount) {
  const currentBalance = economy.get(userId) || 0;
  economy.set(userId, currentBalance + amount);
}

async function generateAiResponse(userMessage) {
  try {
    const response = await axios.post(OPENAI_API_URL, {
      model: "gpt-4-turbo",
      messages: [{ role: 'user', content: userMessage }],
      max_tokens: 100,
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Error generating AI response');
  }
}

client.login(process.env.DISCORD_TOKEN);
