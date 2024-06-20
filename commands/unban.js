const { Permissions } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Unbans a user from the server.',
  async execute(message, args) {
    // Check if the user has permission to unban members
    if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) {
      return message.reply('You do not have permission to use this command.');
    }

    // Check if a user ID was provided
    const userId = args[0];
    if (!userId) {
      return message.reply('Please provide a user ID to unban.');
    }

    try {
      // Fetch the banned users
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.find(ban => ban.user.id === userId);

      // If the user is not banned, return a message
      if (!bannedUser) {
        return message.reply('User is not banned.');
      }

      // Attempt to unban the user
      await message.guild.members.unban(bannedUser.user, 'Unbanned via command');

      // Notify the user and log the action
      message.reply(`User ${bannedUser.user.tag} has been unbanned.`);
      console.log(`User ${bannedUser.user.tag} has been unbanned by ${message.author.tag}`);
    } catch (error) {
      console.error('Error unbanning user:', error);
      message.reply('There was an error unbanning the user.');
    }
  },
};
