const pool = require('../database');

module.exports = {
  name: 'balance',
  description: 'Check your current balance.',
  async execute(message, args) {
    try {
      const [rows] = await pool.query('SELECT * FROM balances WHERE user_id = ?', [message.author.id]);

      if (rows.length > 0) {
        message.reply(`Your current balance is $${rows[0].balance}.`);
      } else {
        message.reply('You do not have a balance yet.');
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      message.reply('There was an error checking your balance.');
    }
  },
};
