const { Client, Intents } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PREFIX = '!';
const restrictedWords = process.env.RESTRICTED_WORDS.split(',');

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // Check for restricted words
  if (restrictedWords.some(word => message.content.includes(word))) {
    message.delete();
    message.channel.send('Your message contained a restricted word and was deleted.');
    return;
  }

  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'help':
      message.channel.send('Available commands: !help, !joke, !talk');
      break;
    case 'joke':
      try {
        const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
        message.channel.send(`${response.data.setup} - ${response.data.punchline}`);
      } catch (error) {
        console.error('Error fetching joke:', error);
        message.channel.send('Sorry, I couldn\'t fetch a joke for you at the moment.');
      }
      break;
    case 'talk':
      const userMessage = args.join(' ');
      message.channel.send(generateAiResponse(userMessage));
      break;
  }
});

function generateAiResponse(userMessage) {
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
  const lowerCaseMessage = userMessage.toLowerCase();

  return Object.keys(responses).find(keyword => lowerCaseMessage.includes(keyword))
    ? responses[keyword]
    : defaultResponse;
}

client.login(process.env.DISCORD_TOKEN);
