const pool = require('../database');

const shopItems = [
  { name: 'Gold', price: 300 },
  { name: 'Diamond', price: 900000000 },
  { name: 'Money x2', price: 500 },
  { name: 'Money x3', price: 3000 },
  { name: 'Money x4', price: 10000 }
];

module.exports = {
  name: 'buy',
  description: 'Buy an item from the shop.',
  async execute(message, args) {
    const itemName = args.join(' ').toLowerCase();

    const item = shopItems.find(item => item.name.toLowerCase() === itemName);
    if (!item) {
      return message.reply('Item not found in the shop.');
    }

    try {
      const [rows] = await pool.query('SELECT * FROM balances WHERE user_id = ?', [message.author.id]);

      if (rows.length === 0 || rows[0].balance < item.price) {
        return message.reply('You do not have enough money to buy this item.');
      }

      await pool.query('UPDATE balances SET balance = balance - ? WHERE user_id = ?', [item.price, message.author.id]);
      message.reply(`You have successfully bought ${item.name}.`);
    } catch (error) {
      console.error('Error buying item:', error);
      message.reply('There was an error while trying to buy this item.');
    }
  },
};
