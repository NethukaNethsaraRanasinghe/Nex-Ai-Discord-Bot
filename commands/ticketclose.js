module.exports = {
  name: 'ticketclose',
  description: 'Closes a ticket channel (admin only).',
  execute(message, args) {
    // Check if the user is an administrator
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate the ticket ID provided
    const ticketId = args[0];
    if (!ticketId) {
      return message.reply('Please provide the ID of the ticket channel to close.');
    }

    // Find the ticket channel by ID
    const ticketChannel = message.guild.channels.cache.get(ticketId);
    if (!ticketChannel || ticketChannel.type !== 'GUILD_TEXT') {
      return message.reply('Invalid ticket channel ID provided.');
    }

    // Delete the ticket channel
    ticketChannel.delete()
      .then(() => {
        message.reply(`Ticket channel ${ticketChannel.name} (${ticketChannel.id}) has been closed.`);
      })
      .catch(error => {
        console.error('Error closing ticket channel:', error);
        message.reply('Failed to close the ticket channel. Please try again later.');
      });
  },
};
