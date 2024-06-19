module.exports = {
  name: 'poll',
  description: 'Creates a yes/no poll in the server (admin only).',
  execute(message, args) {
    // Check if the user is an administrator
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Fetch the poll question
    const pollQuestion = args.join(' ');

    // Validate inputs
    if (!pollQuestion) {
      return message.reply('Please provide a poll question.');
    }

    // Send poll message
    message.channel.send(`📊 **Poll: ${pollQuestion}**`).then(sentMessage => {
      sentMessage.react('👍'); // thumbs up emoji (yes)
      sentMessage.react('👎'); // thumbs down emoji (no)
    }).catch(error => {
      console.error('Error sending poll message:', error);
      message.reply('Failed to create the poll. Please try again later.');
    });
  },
};
