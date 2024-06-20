const fs = require('fs');

module.exports = {
  name: 'autoroleremove',
  description: 'Removes a role from being automatically assigned to new members',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    const roleId = args[0];
    if (!roleId) {
      return message.reply('Usage: !autoroleremove {ROLE_ID}');
    }

    const rolesData = JSON.parse(fs.readFileSync('./autoroles.json'));
    const index = rolesData.roles.indexOf(roleId);
    if (index > -1) {
      rolesData.roles.splice(index, 1);
      fs.writeFileSync('./autoroles.json', JSON.stringify(rolesData, null, 2));
      message.reply(`Role ${roleId} has been removed from the auto role list.`);
    } else {
      message.reply(`Role ${roleId} is not in the auto role list.`);
    }
  }
};
