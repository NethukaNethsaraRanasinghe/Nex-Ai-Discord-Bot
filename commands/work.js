const { CooldownManager } = require('discord.js-commando');
const pool = require('../database');

const cooldownManager = new CooldownManager();

module.exports = {
  name: 'work',
  description: 'Earn a random amount of money (with cooldown).',
  cooldown: 60, // 60 seconds cooldown
  async execute(message, args) {
    if (cooldownManager.has(message.author.id, this.name)) {
      return message.reply(`You can work again in ${cooldownManager.remainingTime(message.author.id, this.name).toFixed(1)} seconds.`);
    }

    try {
      const earnings = Math.floor(Math.random() * 1000) + 1; // Random earnings between 1 and 1000

      await pool.query('UPDATE balances SET balance = balance + ? WHERE user_id = ?', [earnings, message.author.id]);
      
      message.reply(`You worked and earned $${earnings}.`);
      cooldownManager.set(message.author.id, this.name, this.cooldown * 1000); // Set cooldown
    } catch (error) {
      console.error('Error while working:', error);
      message.reply('There was an error while processing your work request.');
    }
  },
};
