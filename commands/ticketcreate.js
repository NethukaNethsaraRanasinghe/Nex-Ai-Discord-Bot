const { Permissions } = require('discord.js');

module.exports = {
  name: 'ticketcreate',
  description: 'Creates a new ticket for support.',
  async execute(message, args) {
    const categoryName = 'tickets'; // Name of the category where tickets will be created (adjust as per your server setup)

    // Find the category channel
    const category = message.guild.channels.cache.find(c => c.name === categoryName && c.type === 'GUILD_CATEGORY');
    if (!category) return message.reply('Ticket category does not exist.');

    // Create a new ticket channel
    try {
      const ticketChannel = await message.guild.channels.create(`ticket-${message.author.id}`, {
        type: 'GUILD_TEXT',
        parent: category.id,
        permissionOverwrites: [
          {
            id: message.guild.roles.everyone,
            deny: ['VIEW_CHANNEL']
          },
          {
            id: message.author.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ADD_REACTIONS']
          }
        ]
      });

      message.reply(`Ticket created! ${ticketChannel}`);
    } catch (error) {
      console.error('Error creating ticket:', error);
      message.reply('Failed to create a ticket. Please try again later.');
    }
  },
};
