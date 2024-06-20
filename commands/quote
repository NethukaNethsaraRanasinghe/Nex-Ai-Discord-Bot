const fetch = require('node-fetch');

module.exports = {
  name: 'quote',
  description: 'Gets a random quote.',
  async execute(message, args) {
    try {
      const response = await fetch('https://api.quotable.io/random');
      const data = await response.json();

      const quote = `
        **${data.content}**
        - ${data.author}
      `;

      message.channel.send(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      message.reply('Failed to fetch quote. Please try again later.');
    }
  },
};
