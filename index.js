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
    message.channel.send('Available commands: !help, !joke');
  } else if (command === 'joke') {
    const joke = await getJoke();
    message.channel.send(joke);
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

// Load prompts and restricted words from environment variables
const restrictedWords = process.env.RESTRICTED_WORDS.split(',');
const gptModel = process.env.GPT_MODEL;
const nagaApiKey = process.env.NAGA_API_KEY;

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

  // Handle AI prompts
  const promptPath = path.join(__dirname, 'prompt.txt');
  if (fs.existsSync(promptPath)) {
    const userPrompt = fs.readFileSync(promptPath, 'utf-8');
    const aiResponse = await getAiResponse(userPrompt);
    message.channel.send(aiResponse);
  }
});

async function getAiResponse(prompt) {
  try {
    const response = await axios.post('https://api.naga.ai/v1/chat', {
      model: gptModel,
      prompt: prompt,
    }, {
      headers: {
        'Authorization': `Bearer ${nagaApiKey}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error('Error fetching AI response:', error);
    return 'Sorry, I couldn\'t fetch a response from the AI at the moment.';
  }
}

client.login(process.env.DISCORD_TOKEN);
