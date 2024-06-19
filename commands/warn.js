module.exports = {
  name: 'warn',
  description: 'Issues a warning to a user (admin only).',
  execute(message, args) {
    // Check if the user is an administrator
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate the user mentioned
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Please mention the user to warn.');
    }

    // Fetch the reason for warning
    const reason = args.slice(1).join(' ').trim();
    if (!reason) {
      return message.reply('Please provide a reason for the warning.');
    }

    // Send warning message to the user
    member.send(`You have been warned in ${message.guild.name} for: ${reason}`)
      .then(() => {
        message.reply(`Successfully warned ${member.user.tag} for: ${reason}`);
      })
      .catch(error => {
        console.error('Error sending warning message:', error);
        message.reply('Failed to warn the user. Please try again later.');
      });
  },
};
