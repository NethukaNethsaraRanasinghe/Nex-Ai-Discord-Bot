const fs = require('fs');

module.exports = {
  name: 'autoroleadd',
  description: 'Adds a role to be automatically assigned to new members',
  async execute(message, args) {
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    const roleId = args[0];
    if (!roleId) {
      return message.reply('Usage: !autoroleadd {ROLE_ID}');
    }

    const rolesData = JSON.parse(fs.readFileSync('./autoroles.json'));
    if (!rolesData.roles.includes(roleId)) {
      rolesData.roles.push(roleId);
      fs.writeFileSync('./autoroles.json', JSON.stringify(rolesData, null, 2));
      message.reply(`Role ${roleId} has been added to the auto role list.`);
    } else {
      message.reply(`Role ${roleId} is already in the auto role list.`);
    }
  }
};
