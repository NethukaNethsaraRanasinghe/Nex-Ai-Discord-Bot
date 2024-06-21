module.exports = {
  name: 'shop',
  description: 'Display items available for purchase.',
  async execute(message, args) {
    const shopItems = [
      { name: 'Gold', price: 300 },
      { name: 'Diamond', price: 900000000 },
      { name: 'Money x2', price: 500 },
      { name: 'Money x3', price: 3000 },
      { name: 'Money x4', price: 10000 }
    ];

    const shopList = shopItems.map(item => `${item.name} - Price: $${item.price}`).join('\n');
    message.channel.send(`**Shop Items:**\n${shopList}`);
  },
};
