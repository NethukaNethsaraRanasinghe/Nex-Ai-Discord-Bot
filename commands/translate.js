const fetch = require('node-fetch');

module.exports = {
  name: 'translate',
  description: 'Translates text to the specified language',
  async execute(message, args) {
    const targetLanguage = args.shift();
    const textToTranslate = args.join(' ');

    if (!targetLanguage || !textToTranslate) {
      return message.reply('Usage: !translate <target_language> <text>');
    }

    try {
      const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: textToTranslate,
          target: targetLanguage
        })
      });

      const data = await response.json();
      const translatedText = data.data.translations[0].translatedText;
      message.reply(translatedText);
    } catch (error) {
      console.error(error);
      message.reply('There was an error trying to translate the text!');
    }
  }
};
