const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'userinfo',
  description: 'Displays information about a user.',
  execute(message, args) {
    // Fetch the user mentioned, default to the author if no user is mentioned
    const user = message.mentions.members.first() || message.member;

    // Create embed to display user info
    const userInfoEmbed = new MessageEmbed()
      .setColor('#ff9900')
      .setTitle('User Information')
      .setThumbnail(user.user.displayAvatarURL({ dynamic: true }))
      .addField('Username', user.user.username, true)
      .addField('User ID', user.id, true)
      .addField('User Tag', user.user.tag, true)
      .addField('Joined Discord', user.user.createdAt.toDateString(), true)
      .addField('Joined Server', user.joinedAt.toDateString(), true)
      .addField('Roles', user.roles.cache.map(role => role.name).join(', '), true)
      .setFooter(`User joined • ${user.joinedAt.toDateString()}`);

    // Send embed message
    message.channel.send({ embeds: [userInfoEmbed] });
  },
};
