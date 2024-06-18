const { Client, Intents } = require('discord.js');
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
      await handleHelpCommand(message);
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
    default:
      await message.channel.send('Unknown command. Type !help for a list of available commands.');
  }
});

async function handleHelpCommand(message) {
  const isAdmin = message.member.permissions.has('KICK_MEMBERS') || message.member.roles.cache.some(role => role.name.toLowerCase() === 'admin');
  const commands = isAdmin ? 'Available commands: !joke, !talk, !ping, !job, !work, !balance, !timeout, !untimeout' : 'Available commands: !help, !joke, !talk, !ping, !job, !work, !balance';
  await message.channel.send(commands);
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
  await message.channel.send(`Pong! Your ping is ${ping}ms.`);
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
