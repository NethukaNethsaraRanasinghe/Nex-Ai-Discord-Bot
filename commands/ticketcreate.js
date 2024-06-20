const { Permissions } = require('discord.js');

module.exports = {
  name: 'ticketcreate',
  description: 'Creates a new ticket for support.',
  async execute(message, args) {
    const categoryName = 'tickets'; // Name of the category where tickets will be created (adjust as per your server setup)

    // Find the category channel
    const category = message.guild.channels.cache.find(c => c.name === categoryName && c.type === 'GUILD_CATEGORY');
    if (!category) return message.reply('Ticket category does not exist.');

    // Generate a random ticket ID
    const ticketId = Math.floor(Math.random() * 900) + 100; // Generates a random 3-digit number (100-999)

    // Check if the generated ticket ID already exists
    while (message.guild.channels.cache.some(channel => channel.name === `ticket-${ticketId}`)) {
      ticketId = Math.floor(Math.random() * 900) + 100; // Regenerate if the ID is already taken
    }

    // Create a new ticket channel
    try {
      const ticketChannel = await message.guild.channels.create(`ticket-${ticketId}`, {
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

      // Optionally, you can add a message informing the user about the created ticket channel
      message.reply(`Ticket created! #${ticketId} ${ticketChannel}`);

      // Automatically add the user to the ticket channel
      ticketChannel.permissionOverwrites.edit(message.author.id, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true,
        ADD_REACTIONS: true
      });

    } catch (error) {
      console.error('Error creating ticket:', error);
      message.reply('Failed to create a ticket. Please try again later.');
    }
  },
};
