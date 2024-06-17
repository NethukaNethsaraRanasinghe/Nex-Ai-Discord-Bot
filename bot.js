const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Define the file contents
const envContent = `DISCORD_TOKEN=your_discord_bot_token
NAGA_AI_API_KEY=your_naga_ai_api_key
GPT_MODEL=text-davinci-003
`;

const configJsonContent = `{
  "blockedWords": ["badword1", "badword2"]
}`;

const promptTxtContent = `You are a friendly and helpful assistant. Today you are helping users with their questions:
`;

const indexJsContent = `require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const PREFIX = '!';
const CONFIG_PATH = path.join(__dirname, '../config/config.json');
const PROMPT_PATH = path.join(__dirname, '../config/prompt.txt');

let config = {
  blockedWords: []
};

// Load configuration
function loadConfig() {
  try {
    const configFile = fs.readFileSync(CONFIG_PATH, 'utf-8');
    config = JSON.parse(configFile);
  } catch (error) {
    console.error('Failed to load config:', error);
  }
}

loadConfig();

client.once('ready', () => {
  console.log(\`Logged in as \${client.user.tag}!\`);
});

client.on('messageCreate', async (message) => {
  if (!message.content.startsWith(PREFIX) || message.author.bot) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Check for blocked words
  if (config.blockedWords.some((word) => message.content.includes(word))) {
    return;
  }

  if (command === 'help') {
message.channel.send('Available commands:\n!help\n!joke\n!ai <prompt>');
  }

  if (command === 'joke') {
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      message.channel.send(`${response.data.setup} - `${response.data.punchline}`);
    } catch (error) {
      message.channel.send('Failed to fetch a joke.');
    }
  }

  if (command === 'ai') {
    const userPrompt = args.join(' ');
    const customPrompt = fs.readFileSync(PROMPT_PATH, 'utf-8');

    try {
      const response = await axios.post(
        'https://naga-api.com/v1/ai/generate',
        {
          model: process.env.GPT_MODEL,
          prompt: `${customPrompt}\n${userPrompt}`,
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.NAGA_AI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      message.channel.send(response.data.choices[0].text.trim());
    } catch (error) {
      message.channel.send('Failed to generate AI response.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
`;

// Create the necessary directories and files
const setup = async () => {
  try {
    console.log('Initializing project...');

    // Initialize Node.js project
    exec('npm init -y', (err, stdout, stderr) => {
      if (err) {
        console.error('Failed to initialize Node.js project:', stderr);
        return;
      }

      console.log('Installing necessary packages...');
      // Install necessary packages
      exec('npm install discord.js dotenv axios fs', (err, stdout, stderr) => {
        if (err) {
          console.error('Failed to install packages:', stderr);
          return;
        }

        // Ensure directories exist
        if (!fs.existsSync(path.join(dirname, 'config'))) {
          fs.mkdirSync(path.join(dirname, 'config'), { recursive: true });
        }

        if (!fs.existsSync(path.join(__dirname, 'src'))) {
[]
          fs.mkdirSync(path.join(__dirname, 'src'), { recursive: true });
        }

        // Create initial files
        console.log('Creating configuration files...');
        if (!fs.existsSync(path.join(__dirname, '.env'))) {
          fs.writeFileSync(path.join(__dirname, '.env'), envContent);
        }

        if (!fs.existsSync(path.join(__dirname, 'config/config.json'))) {
          fs.writeFileSync(path.join(__dirname, 'config/config.json'), configJsonContent);
        }

        if (!fs.existsSync(path.join(__dirname, 'config/prompt.txt'))) {
          fs.writeFileSync(path.join(__dirname, 'config/prompt.txt'), promptTxtContent);
        }

        if (!fs.existsSync(path.join(__dirname, 'src/index.js'))) {
          fs.writeFileSync(path.join(__dirname, 'src/index.js'), indexJsContent);
        }

        console.log('Setup complete. Please replace the placeholders in .env with your actual tokens.');
      });
    });
  } catch (err) {
    console.error('Error during setup:', err);
  }
};

setup();
