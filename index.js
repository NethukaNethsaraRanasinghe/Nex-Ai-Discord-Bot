const { Client, Intents } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS] });
const PREFIX = '!';
const restrictedWords = process.env.RESTRICTED_WORDS.split(',');
const OPENAI_API_URL = 'https://heckerai.uk.to/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const messageHistory = new Map();
const warnings = new Map();

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
      if (message.member.permissions.has('KICK_MEMBERS') || message.member.roles.cache.some(role => role.name.toLowerCase() === 'admin')) {
        message.channel.send('Available commands: !help, !joke, !talk, !ping, !warn, !kick');
      } else {
        message.channel.send('Available commands: !help, !joke, !talk, !ping');
      }
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
    case 'ping':
      const ping = Date.now() - message.createdTimestamp;
      message.channel.send(`Pong! Your ping is ${ping}ms.`);
      break;
    case 'kick':
      if (!message.member.permissions.has('KICK_MEMBERS') && !message.member.roles.cache.some(role => role.name.toLowerCase() === 'admin')) {
        message.channel.send('You do not have permission to use this command.');
        return;
      }
      const userToKick = message.mentions.members.first();
      if (!userToKick) {
        message.channel.send('Please mention a user to kick.');
        return;
      }
      if (!userToKick.kickable) {
        message.channel.send('I cannot kick this user.');
        return;
      }
      try {
        await userToKick.kick();
        message.channel.send(`${userToKick.user.tag} has been kicked.`);
      } catch (error) {
        console.error('Error kicking user:', error);
        message.channel.send('Sorry, I couldn\'t kick the user.');
      }
      break;
    case 'warn':
      if (!message.member.permissions.has('KICK_MEMBERS') && !message.member.roles.cache.some(role => role.name.toLowerCase() === 'admin')) {
        message.channel.send('You do not have permission to use this command.');
        return;
      }
      const userToWarn = message.mentions.members.first();
      if (!userToWarn) {
        message.channel.send('Please mention a user to warn.');
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
        message.channel.send('Sorry, I couldn\'t warn the user.');
      }
      message.channel.send(`${userToWarn.user.tag} has been warned. They have ${warnings.get(userToWarn.id)} warnings.`);
      if (warnings.get(userToWarn.id) >= 3) {
        try {
          await userToWarn.kick();
          message.channel.send(`${userToWarn.user.tag} has been kicked for receiving 3 warnings.`);
        } catch (error) {
          console.error('Error auto-kicking user:', error);
          message.channel.send('Sorry, I couldn\'t kick the user after 3 warnings.');
        }
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
