module.exports = {
  name: 'ban',
  description: 'Bans a user from the server (admin only).',
  execute(message, args) {
    // Check if the user is an administrator
    if (!message.member.permissions.has('BAN_MEMBERS')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate the user mentioned
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Please mention the user to ban.');
    }

    // Check if the user can be banned
    if (!member.bannable) {
      return message.reply('Unable to ban this user.');
    }

    // Ban the user
    member.ban()
      .then(() => {
        message.reply(`${member.user.tag} has been banned from the server.`);
      })
      .catch(error => {
        console.error('Error banning user:', error);
        message.reply('Failed to ban the user. Please try again later.');
      });
  },
};
