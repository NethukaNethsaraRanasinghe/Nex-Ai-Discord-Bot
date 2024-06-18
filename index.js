const { Client, Intents } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const PREFIX = '!';
const restrictedWords = process.env.RESTRICTED_WORDS.split(',');
const OPENAI_API_URL = 'https://heckerai.uk.to/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const warnings = new Map();
const examplePrompts = [
  "Hello, how can I help you today?",
  "What's on your mind?",
  "Tell me something interesting.",
  // Add more prompts as needed, up to 900 examples
];

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

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
    case 'kick':
      await handleKickCommand(message);
      break;
    case 'warn':
      await handleWarnCommand(message);
      break;
    default:
      await message.channel.send('Unknown command. Type !help for a list of available commands.');
  }
});

async function handleHelpCommand(message) {
  const isAdmin = message.member.permissions.has('KICK_MEMBERS') || message.member.roles.cache.some(role => role.name.toLowerCase() === 'admin');
  const commands = isAdmin ? 'Available commands: !help, !joke, !talk, !ping, !warn, !kick' : 'Available commands: !help, !joke, !talk, !ping';
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

async function handleKickCommand(message) {
  if (!message.member.permissions.has('KICK_MEMBERS') && !message.member.roles.cache.some(role => role.name.toLowerCase() === 'admin')) {
    await message.channel.send('You do not have permission to use this command.');
    return;
  }

  const userToKick = message.mentions.members.first();
  if (!userToKick) {
    await message.channel.send('Please mention a user to kick.');
    return;
  }

  if (!userToKick.kickable) {
    await message.channel.send('I cannot kick this user.');
    return;
  }

  try {
    await userToKick.kick();
    await message.channel.send(`${userToKick.user.tag} has been kicked.`);
  } catch (error) {
    console.error('Error kicking user:', error);
    await message.channel.send('Sorry, I couldn\'t kick the user.');
  }
}

async function handleWarnCommand(message) {
  if (!message.member.permissions.has('KICK_MEMBERS') && !message.member.roles.cache.some(role => role.name.toLowerCase() === 'admin')) {
    await message.channel.send('You do not have permission to use this command.');
    return;
  }

  const userToWarn = message.mentions.members.first();
  if (!userToWarn) {
    await message.channel.send('Please mention a user to warn.');
    return;
  }

  if (!warnings.has(userToWarn.id)) {
    warnings.set(userToWarn.id, 0);
  }

  warnings.set(userToWarn.id, warnings.get(userToWarn.id) + 1);
  try {
    await userToWarn.send('You have been warned.');
  } catch (error) {
    console.error('Error sending warning DM:', error);
    await message.channel.send('Sorry, I couldn\'t warn the user.');
  }

  await message.channel.send(`${userToWarn.user.tag} has been warned. They have ${warnings.get(userToWarn.id)} warnings.`);
  if (warnings.get(userToWarn.id) >= 3) {
    try {
      await userToWarn.kick();
      await message.channel.send(`${userToWarn.user.tag} has been kicked for receiving 3 warnings.`);
    } catch (error) {
      console.error('Error auto-kicking user:', error);
      await message.channel.send('Sorry, I couldn\'t kick the user after 3 warnings.');
    }
  }
}

function getRandomPrompt() {
  return examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
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
