module.exports = {
  name: 'kick',
  description: 'Kicks a user from the server (admin only).',
  execute(message, args) {
    // Check if the user is an administrator
    if (!message.member.permissions.has('KICK_MEMBERS')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate the user mentioned
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Please mention the user to kick.');
    }

    // Check if the user can be kicked
    if (!member.kickable) {
      return message.reply('Unable to kick this user.');
    }

    // Kick the user
    member.kick()
      .then(() => {
        message.reply(`${member.user.tag} has been kicked from the server.`);
      })
      .catch(error => {
        console.error('Error kicking user:', error);
        message.reply('Failed to kick the user. Please try again later.');
      });
  },
};
