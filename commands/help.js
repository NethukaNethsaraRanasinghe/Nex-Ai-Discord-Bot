const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Lists all available commands.',
  execute(message, args) {
    const embed = new MessageEmbed()
      .setTitle('Help - List of Commands')
      .setColor('#0099ff')
      .setDescription('Here is a list of all available commands:')
      .setTimestamp()
      .addFields(
        { name: '!help', value: 'Lists all available commands.' },
        { name: '!8ball {QUESTION}', value: 'Answers a yes/no question.' },
        { name: '!ban @user {REASON}', value: 'Bans the mentioned user. Admin only.' },
        { name: '!kick @user {REASON}', value: 'Kicks the mentioned user. Admin only.' },
        { name: '!warn @user {REASON}', value: 'Warns the mentioned user. Admin only.' },
        { name: '!ticketcreate', value: 'Creates a support ticket channel.' },
        { name: '!ticketclose {CHANNEL_ID}', value: 'Closes the specified ticket channel. Admin only.' },
        { name: '!userinfo @user', value: 'Displays information about the mentioned user.' },
        { name: '!poll {QUESTION}', value: 'Creates a yes/no poll. Admin only.' },
        { name: '!timeout @user {DURATION}', value: 'Times out the mentioned user. Admin only.' },
        { name: '!untimeout @user', value: 'Removes the timeout from the mentioned user. Admin only.' },
        { name: '!joke', value: 'Fetches a random joke.' },
        { name: '!purge {AMOUNT}', value: 'Deletes the specified number of messages. Admin only.' },
        { name: '!ping', value: 'Checks the bot\'s latency.' },
        { name: '!uptime', value: 'Displays the bot\'s uptime.' },
        { name: '!translate {WORD} {LANGUAGE}', value: 'Translates the specified word to the specified language.' },
        { name: '!remind {MESSAGE} {TIME}', value: 'Sets a reminder with the specified message and time.' },
        { name: '!avatar @user', value: 'Displays the avatar of the mentioned user.' },
        { name: '!roll {SIDES}', value: 'Rolls a dice with the specified number of sides.' },
        { name: '!weather {CITY}', value: 'Fetches the weather information for the specified city.' },
        { name: '!quote', value: 'Fetches a random inspirational quote.' },
        { name: '!autoroleadd {ROLE_ID}', value: 'Add a autorole when so it adds a role when a members joins.' },
        { name: '!autoroleremove {ROLE_ID}', value: 'Removes the role from auto role.' },
      );

    message.channel.send({ embeds: [embed] });
  },
};
