const fetch = require('node-fetch');

module.exports = {
  name: 'joke',
  description: 'Tells a random joke fetched from a joke API.',
  async execute(message, args) {
    try {
      const jokeData = await fetch('https://official-joke-api.appspot.com/jokes/random');
      const joke = await jokeData.json();

      if (!joke.setup || !joke.punchline) {
        throw new Error('Failed to fetch joke from API.');
      }

      message.channel.send(`**${joke.setup}**\n||${joke.punchline}||`);
    } catch (error) {
      console.error('Error fetching joke:', error);
      message.reply('Failed to fetch a joke. Please try again later.');
    }
  },
};
