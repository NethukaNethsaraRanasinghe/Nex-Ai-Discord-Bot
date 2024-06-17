const { Client, Intents } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const PREFIX = '!';

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    message.channel.send('Available commands: !help, !joke, !talk');
  } else if (command === 'joke') {
    const joke = await getJoke();
    message.channel.send(joke);
  } else if (command === 'talk') {
    const userMessage = args.join(' ');
    const aiResponse = generateAiResponse(userMessage);
    message.channel.send(aiResponse);
  }
});

async function getJoke() {
  try {
    const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
    return `${response.data.setup} - ${response.data.punchline}`;
  } catch (error) {
    console.error('Error fetching joke:', error);
    return 'Sorry, I couldn\'t fetch a joke for you at the moment.';
  }
}

function generateAiResponse(userMessage) {
  // Basic keyword matching logic to generate responses
  const responses = {
    hello: 'Hi there! How can I help you today?',
    how: 'I\'m just a bot, but I\'m doing great! How about you?',
    help: 'Sure! What do you need help with?',
    weather: 'I can\'t check the weather right now, but it\'s always a good idea to carry an umbrella just in case!',
    food: 'I love talking about food! What\'s your favorite dish?',
    time: 'I don\'t have a watch, but I can always make time for you!',
    bot: 'Yes, I am a bot. How can I assist you today?'
  };

  const defaultResponse = 'That sounds interesting! Tell me more.';

  // Convert user message to lowercase for matching
  const lowerCaseMessage = userMessage.toLowerCase();

  // Find a matching response or use the default response
  for (const keyword in responses) {
    if (lowerCaseMessage.includes(keyword)) {
      return responses[keyword];
    }
  }

  return defaultResponse;
}

// Load restricted words from environment variables
const restrictedWords = process.env.RESTRICTED_WORDS.split(',');

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Check for restricted words
  for (let word of restrictedWords) {
    if (message.content.includes(word)) {
      message.delete();
      message.channel.send('Your message contained a restricted word and was deleted.');
      return;
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
