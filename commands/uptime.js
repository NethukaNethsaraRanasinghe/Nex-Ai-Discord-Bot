module.exports = {
  name: 'uptime',
  description: 'Displays the bot\'s uptime',
  execute(message, args) {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    message.reply(`Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s`);
  }
};
