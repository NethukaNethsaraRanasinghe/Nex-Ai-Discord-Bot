const fs = require('fs');
const { Permissions } = require('discord.js');

module.exports = {
  name: 'autorole',
  description: 'Add a role to be assigned automatically to new members.',
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
      const autoroles = JSON.parse(fs.readFileSync('./autoroles.json', 'utf-8'));

      if (autoroles.roles.includes(roleID)) {
        return message.reply('This role is already set as an autorole.');
      }

      autoroles.roles.push(roleID);

      fs.writeFileSync('./autoroles.json', JSON.stringify(autoroles, null, 2));

      message.reply(`Role ${roleID} added as an autorole.`);
    } catch (error) {
      console.error('Error adding autorole:', error);
      message.reply('There was an error adding the autorole.');
    }
  },
};
