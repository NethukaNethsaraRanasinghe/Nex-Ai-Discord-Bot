const fetch = require('node-fetch');

module.exports = {
  name: 'translate',
  description: 'Translates a word or phrase into the specified language.',
  async execute(message, args) {
    // Check if both word and language are provided
    if (args.length < 2) {
      return message.reply('Please provide a word/phrase and a language code to translate to.');
    }

    const word = args.slice(0, -1).join(' ');
    const language = args[args.length - 1];

    try {
      // Fetch translation from translation API
      const translationData = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=auto|${language}`);
      const translationJson = await translationData.json();

      // Check if translation was successful
      if (!translationJson.responseData || !translationJson.responseData.translatedText) {
        throw new Error('Failed to translate. Please check your input and try again.');
      }

      // Send translated text back to the channel
      message.channel.send(`**${word}** translated to **${language.toUpperCase()}**: ${translationJson.responseData.translatedText}`);
    } catch (error) {
      console.error('Error translating:', error);
      message.reply('Failed to translate. Please try again later.');
    }
  },
};
