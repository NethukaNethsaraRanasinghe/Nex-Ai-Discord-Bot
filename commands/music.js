const ytdl = require('ytdl-core');

module.exports = {
  name: 'musicplay',
  description: 'Plays music in the voice channel of the user who requested it.',
  async execute(message, args) {
    // Check if the user is in a voice channel
    if (!message.member.voice.channel) {
      return message.reply('You need to be in a voice channel to play music.');
    }

    // Check if the bot has permissions to join and speak in the voice channel
    const permissions = message.member.voice.channel.permissionsFor(message.client.user);
    if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
      return message.reply('I need the permissions to join and speak in your voice channel.');
    }

    // Join the user's voice channel
    const connection = await message.member.voice.channel.join();

    // Validate YouTube URL or search term
    const url = args[0];
    if (!url) {
      return message.reply('Please provide a YouTube URL or search term.');
    }

    // Play music
    try {
      const stream = ytdl(url, { filter: 'audioonly' });
      connection.play(stream, { seek: 0, volume: 1 })
        .on('finish', () => {
          message.member.voice.channel.leave();
        });
      
      message.channel.send(`Now playing: ${url}`);
    } catch (error) {
      console.error('Error playing music:', error);
      message.reply('Failed to play music. Please try again later.');
    }
  },
  
  async stop(message, args) {
    // Check if the bot is in a voice channel
    if (!message.guild.me.voice.channel) {
      return message.reply('I\'m not currently in a voice channel.');
    }

    // Check if the user is in the same voice channel as the bot
    if (message.member.voice.channel !== message.guild.me.voice.channel) {
      return message.reply('You need to be in the same voice channel as me to stop the music.');
    }

    // Stop playing and leave the voice channel
    message.guild.me.voice.channel.leave();
    message.channel.send('Music stopped.');
  },

  async resume(message, args) {
    // Check if the bot is in a voice channel
    if (!message.guild.me.voice.channel) {
      return message.reply('I\'m not currently in a voice channel.');
    }

    // Check if the user is in the same voice channel as the bot
    if (message.member.voice.channel !== message.guild.me.voice.channel) {
      return message.reply('You need to be in the same voice channel as me to resume the music.');
    }

    // Resume playback
    const connection = message.guild.me.voice.channel;
    if (connection.dispatcher) {
      connection.dispatcher.resume();
      message.channel.send('Music resumed.');
    }
  },

  async pause(message, args) {
    // Check if the bot is in a voice channel
    if (!message.guild.me.voice.channel) {
      return message.reply('I\'m not currently in a voice channel.');
    }

    // Check if the user is in the same voice channel as the bot
    if (message.member.voice.channel !== message.guild.me.voice.channel) {
      return message.reply('You need to be in the same voice channel as me to pause the music.');
    }

    // Pause playback
    const connection = message.guild.me.voice.channel;
    if (connection.dispatcher) {
      connection.dispatcher.pause();
      message.channel.send('Music paused.');
    }
  }
};
