module.exports = {
  name: 'purge',
  description: 'Deletes a specified number of messages (admin only).',
  execute(message, args) {
    // Check if the user is an administrator
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Parse amount to delete
    const amount = parseInt(args[0]);

    // Validate input
    if (isNaN(amount) || amount <= 0 || amount > 100) {
      return message.reply('Please provide a valid number of messages to delete (1-100).');
    }

    // Delete messages
    message.channel.bulkDelete(amount, true)
      .then(deletedMessages => {
        message.channel.send(`Deleted ${deletedMessages.size} messages.`)
          .then(msg => {
            msg.delete({ timeout: 5000 }); // Delete the response message after 5 seconds
          })
          .catch(console.error);
      })
      .catch(error => {
        console.error('Error deleting messages:', error);
        message.reply('Failed to delete messages. Please try again later.');
      });
  },
};
