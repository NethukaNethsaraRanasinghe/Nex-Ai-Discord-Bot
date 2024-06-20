const fs = require('fs');
const { Permissions } = require('discord.js');

module.exports = {
  name: 'removeautorole',
  description: 'Remove a role from autoroles.',
  async execute(message, args) {
    // Check if user has permission to manage roles
    if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_ROLES)) {
      return message.reply('You do not have permission to use this command.');
    }

    const roleID = args[0];
    if (!roleID) {
      return message.reply('Please provide a role ID.');
    }

    try {
      let autoroles = JSON.parse(fs.readFileSync('./autoroles.json', 'utf-8'));

      if (!autoroles.roles.includes(roleID)) {
        return message.reply('This role is not set as an autorole.');
      }

      autoroles.roles = autoroles.roles.filter(id => id !== roleID);

      fs.writeFileSync('./autoroles.json', JSON.stringify(autoroles, null, 2));

      message.reply(`Role ${roleID} removed from autoroles.`);
    } catch (error) {
      console.error('Error removing autorole:', error);
      message.reply('There was an error removing the autorole.');
    }
  },
};
