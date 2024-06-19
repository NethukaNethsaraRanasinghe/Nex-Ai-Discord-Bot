const { MessageEmbed } = require('discord.js');
const moment = require('moment');

module.exports = {
  name: 'uptime',
  description: 'Shows how long the bot has been online.',
  execute(message, args, client) {
    const uptime = moment.duration(client.uptime).format('d[d] h[h] m[m] s[s]');
    
    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Bot Uptime')
      .setDescription(`I have been online for: **${uptime}**.`)
      .setTimestamp();

    message.channel.send(embed);
  },
};
