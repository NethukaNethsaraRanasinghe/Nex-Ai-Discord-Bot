module.exports = {
  name: '8ball',
  description: 'Answers a yes/no question with a 🎱 emoji.',
  execute(message, args) {
    if (!args.length) return message.reply('Please ask a yes/no question.');

    const responses = [
      'It is certain.',
      'It is decidedly so.',
      'Without a doubt.',
      'Yes, definitely.',
      'You may rely on it.',
      'As I see it, yes.',
      'Most likely.',
      'Outlook good.',
      'Yes.',
      'Signs point to yes.',
      'Reply hazy, try again.',
      'Ask again later.',
      'Better not tell you now.',
      'Cannot predict now.',
      'Concentrate and ask again.',
      'Don’t count on it.',
      'My reply is no.',
      'My sources say no.',
      'Outlook not so good.',
      'Very doubtful.',
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    message.channel.send(`🎱 ${response}`);
  },
};
