module.exports = {
  name: 'ping',
  description: 'Checks the bot\'s latency to Discord servers.',
  execute(message, args) {
    // Send a message to the channel with the bot's latency
    message.channel.send(`Pong! Latency is ${Date.now() - message.createdTimestamp}ms.`);
  },
};
