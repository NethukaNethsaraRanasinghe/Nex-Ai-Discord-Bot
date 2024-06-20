const axios = require('axios');
require('dotenv').config();

const OPENAI_API_URL = 'https://heckerai.uk.to/v1/chat/completions';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

module.exports = {
  name: 'talk',
  description: 'Generates a response using OpenAI with message history for the entire server.',
  async execute(message, args, messageHistory) {
    if (!args.length) return message.reply('Please provide a message to talk about.');

    const userMessage = args.join(' ');

    if (!messageHistory.has(message.guild.id)) {
      messageHistory.set(message.guild.id, []);
    }

    const history = messageHistory.get(message.guild.id);
    history.push({ role: 'user', content: userMessage });

    try {
      const aiResponse = await generateAiResponse(history);
      history.push({ role: 'assistant', content: aiResponse });
      message.channel.send(aiResponse);
    } catch (error) {
      console.error('Error generating AI response:', error);
      message.channel.send('Sorry, I couldn\'t generate a response at the moment.');
    }
  },
};

async function generateAiResponse(history) {
  try {
    const response = await axios.post(OPENAI_API_URL, {
      model: "gpt-3.5-turbo",
      messages: history,
      max_tokens: 100,
      temperature: 0.7
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Error generating AI response');
  }
}
