const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'poll',
  description: 'Creates a poll in the server (admin only).',
  execute(message, args) {
    // Check if the user is an administrator
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Fetch the poll question and choices
    const pollQuestion = args[0];
    const pollOptions = args.slice(1);

    // Validate inputs
    if (!pollQuestion || pollOptions.length < 2) {
      return message.reply('Please provide a poll question and at least two options.');
    }

    // Create poll embed
    const pollEmbed = new MessageEmbed()
      .setColor('#ff9900')
      .setTitle('Poll')
      .setDescription(`**${pollQuestion}**`)
      .addField('Options', pollOptions.map((option, index) => `${index + 1}. ${option}`).join('\n'))
      .setFooter(`Poll created by ${message.author.tag}`);

    // Send poll message
    message.channel.send({ embeds: [pollEmbed] })
      .then(sentMessage => {
        // Add reactions for each option
        for (let i = 0; i < pollOptions.length; i++) {
          sentMessage.react(getEmoji(i + 1));
        }
      })
      .catch(error => {
        console.error('Error sending poll message:', error);
        message.reply('Failed to create the poll. Please try again later.');
      });
  },
};

// Helper function to get emoji based on option index
function getEmoji(index) {
  const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
  return emojis[index - 1];
}
