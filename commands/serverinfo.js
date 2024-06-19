const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'serverinfo',
  description: 'Displays information about the server.',
  execute(message, args) {
    // Collect server information
    const server = message.guild;

    // Create embed to display server info
    const serverInfoEmbed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Server Information')
      .setThumbnail(server.iconURL({ dynamic: true }))
      .addField('Server Name', server.name, true)
      .addField('Server ID', server.id, true)
      .addField('Region', server.region.toUpperCase(), true)
      .addField('Total Members', server.memberCount, true)
      .addField('Owner', server.owner.user.tag, true)
      .addField('Boost Tier', server.premiumTier, true)
      .addField('Creation Date', server.createdAt.toDateString(), true)
      .setFooter(`Server created • ${server.createdAt.toDateString()}`);

    // Send embed message
    message.channel.send({ embeds: [serverInfoEmbed] });
  },
};
