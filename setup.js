const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Function to execute shell commands
function execCommand(command) {
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

// Check if Node.js and npm are installed
try {
  execCommand('node -v');
  execCommand('npm -v');
} catch {
  console.error('Node.js or npm is not installed. Please install them before running this script.');
  process.exit(1);
}

// Install npm packages
console.log('Installing npm packages...');
execCommand('npm install');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('Creating .env file...');
  fs.writeFileSync(envPath, `DISCORD_TOKEN=your_discord_bot_token
GROQ_API_KEY=your_groq_api_key
GPT_MODEL=gpt-4
RESTRICTED_WORDS=word1,word2,word3`);
  console.log('.env file created. Please update it with your actual credentials.');
} else {
  console.log('.env file already exists. Skipping creation.');
}

// Create prompt.txt file if it doesn't exist
const promptPath = path.join(__dirname, 'prompt.txt');
if (!fs.existsSync(promptPath)) {
  console.log('Creating prompt.txt file...');
  fs.writeFileSync(promptPath, 'This is the initial prompt text. Users can modify this file to change the bot\'s responses.');
  console.log('prompt.txt file created.');
} else {
  console.log('prompt.txt file already exists. Skipping creation.');
}

console.log('Setup complete. You can start the bot with \'npm start\'.');
