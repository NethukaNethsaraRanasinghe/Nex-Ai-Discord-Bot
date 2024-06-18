const { Client, Intents } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const PREFIX = '!';
const restrictedWords = process.env.RESTRICTED_WORDS.split(',');
const OPENAI_API_URL = 'https://heckerai.uk.to/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const messageHistory = new Map();

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
      try {
        const aiResponse = await generateAiResponse(message.channel.id, userMessage);
        message.channel.send(aiResponse);
      } catch (error) {
        console.error('Error generating AI response:', error);
        message.channel.send('Sorry, I couldn\'t generate a response at the moment.');
      }
      break;
  }
});

async function generateAiResponse(channelId, userMessage) {
  if (!messageHistory.has(channelId)) {
    messageHistory.set(channelId, []);
  }

  const history = messageHistory.get(channelId);
  history.push({ role: 'user', content: userMessage });

  try {
    const response = await axios.post(OPENAI_API_URL, {
      messages: history,
      max_tokens: 100,
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    const aiResponse = response.data.choices[0].message.content.trim();
    history.push({ role: 'assistant', content: aiResponse });

    return aiResponse;
  } catch (error) {
    throw new Error('Error generating AI response');
  }
}

client.login(process.env.DISCORD_TOKEN);
