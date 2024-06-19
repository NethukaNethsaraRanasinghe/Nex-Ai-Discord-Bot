module.exports = {
  name: 'untimeout',
  description: 'Removes timeout from a user (admin only).',
  execute(message, args) {
    // Check if the user is an administrator
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate the user mentioned
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Please mention the user to untimeout.');
    }

    // Remove timeout role
    member.roles.remove('YOUR_TIMEOUT_ROLE_ID')
      .then(() => {
        message.channel.send(`${member.user.tag}'s timeout has been removed.`);
      })
      .catch(error => {
        console.error('Error removing timeout role:', error);
        message.reply('Failed to remove timeout. Please try again later.');
      });
  },
};
