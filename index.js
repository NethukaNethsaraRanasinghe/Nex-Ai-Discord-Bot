require('dotenv').config();
const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client({
  intents: [
    Discord.Intents.FLAGS.GUILDS,
    Discord.Intents.FLAGS.GUILD_MESSAGES,
    Discord.Intents.FLAGS.DIRECT_MESSAGES
  ]
});

const PREFIX = '~';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.reply('Pong!');
  }

  else if (command === '8ball') {
    const responses = [
      '🎱 It is certain.',
      '🎱 It is decidedly so.',
      '🎱 Without a doubt.',
      '🎱 Yes - definitely.',
      '🎱 You may rely on it.',
      '🎱 As I see it, yes.',
      '🎱 Most likely.',
      '🎱 Outlook good.',
      '🎱 Yes.',
      '🎱 Signs point to yes.',
      '🎱 Reply hazy, try again.',
      '🎱 Ask again later.',
      '🎱 Better not tell you now.',
      '🎱 Cannot predict now.',
      '🎱 Concentrate and ask again.',
      '🎱 Don\'t count on it.',
      '🎱 My reply is no.',
      '🎱 My sources say no.',
      '🎱 Outlook not so good.',
      '🎱 Very doubtful.'
    ];
    const response = responses[Math.floor(Math.random() * responses.length)];
    message.reply(response);
  }

  else if (command === 'joke') {
    try {
      const response = await axios.get('https://official-joke-api.appspot.com/random_joke');
      message.reply(`${response.data.setup}\n*${response.data.punchline}*`);
    } catch (error) {
      console.error('Error fetching joke:', error);
      message.reply('Failed to fetch a joke. Please try again later.');
    }
  }

  else if (command === 'userinfo') {
    const user = message.mentions.users.first() || message.author;
    const member = message.guild.members.cache.get(user.id);

    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`User Info - ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: 'Tag', value: user.tag, inline: true },
        { name: 'ID', value: user.id, inline: true },
        { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: 'Joined Discord', value: user.createdAt.toLocaleDateString('en-US'), inline: true },
        { name: 'Joined Server', value: member.joinedAt.toLocaleDateString('en-US'), inline: true },
      );
    
    message.channel.send({ embeds: [embed] });
  }


  else if (command === 'avatar') {
    const user = message.mentions.users.first() || message.author;
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${user.tag}'s Avatar`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }));
    message.channel.send({ embeds: [embed] });
  }

  else if (command === 'say') {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) return message.reply('You do not have permission to use this command.');
    const sayMessage = args.join(' ');
    message.delete().catch(O_o => {}); // Delete the command message
    message.channel.send(sayMessage);
  }

  else if (command === 'poll') {
    const pollQuestion = args.join(' ');
    if (!pollQuestion) return message.reply('Please provide a question for the poll.');

    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Poll')
      .setDescription(pollQuestion)
      .setFooter('React to vote');
    
    const pollMessage = await message.channel.send({ embeds: [embed] });
    await pollMessage.react('👍');
    await pollMessage.react('👎');
  }

  else if (command === 'ban') {
    if (!message.member.permissions.has('BAN_MEMBERS')) return message.reply('You do not have permission to use this command.');
    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a valid member of this server');
    if (!member.bannable) return message.reply('I cannot ban this user! Do they have a higher role? Do I have ban permissions?');
    
    let reason = args.slice(1).join(' ');
    if (!reason) reason = 'No reason provided';

    await member.ban({ reason })
      .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
    message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
  }

  else if (command === 'kick') {
    if (!message.member.permissions.has('KICK_MEMBERS')) return message.reply('You do not have permission to use this command.');
    const member = message.mentions.members.first();
    if (!member) return message.reply('Please mention a valid member of this server');
    if (!member.kickable) return message.reply('I cannot kick this user! Do they have a higher role? Do I have kick permissions?');

    let reason = args.slice(1).join(' ');
    if (!reason) reason = 'No reason provided';

    await member.kick(reason)
      .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
    message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
  }

  else if (command === 'ticketcreate') {
    // Example of a ticket create command (can be expanded as needed)
    const category = message.guild.channels.cache.find(c => c.name === 'tickets' && c.type === 'GUILD_CATEGORY');
    if (!category) return message.reply('Ticket category does not exist.');

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
  }

  else if (command === 'ticketclose') {
    // Example of a ticket close command (requires admin permissions)
    if (!message.member.permissions.has('ADMINISTRATOR')) return message.reply('You do not have permission to use this command.');
    const ticketId = args[0];
    if (!ticketId) return message.reply('Please provide a ticket ID to close.');

    const channel = message.guild.channels.cache.find(c => c.name === `ticket-${ticketId}`);
    if (!channel) return message.reply('Ticket channel not found.');

    channel.delete();
    message.reply(`Ticket ${ticketId} has been closed.`);
  }

  else if (command === 'help') {
    const embed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle('Bot Commands')
      .setDescription('Here are the available commands:')
      .addFields(
        { name: '!ping', value: 'Responds with Pong!' },
        { name: '!8ball <question>', value: 'Ask the 8ball a question.' },
        { name: '!joke', value: 'Tells you a random joke.' },
        { name: '!userinfo [@mention]', value: 'Shows info about a user.' },
        { name: '!serverinfo', value: 'Shows info about the server.' },
        { name: '!avatar [@mention]', value: 'Shows the avatar of a user.' },
        { name: '!say <message>', value: 'Make the bot say something.' },
        { name: '!poll <question>', value: 'Start a poll with reactions.' },
        { name: '!ban <@user> [reason]', value: 'Bans a user from the server.' },
        { name: '!kick <@user> [reason]', value: 'Kicks a user from the server.' },
        { name: '!ticketcreate', value: 'Creates a new ticket for support.' },
        { name: '!ticketclose <TICKET_ID>', value: 'Closes a ticket (admin only).' },
        // Add more commands here...
      );

    message.channel.send({ embeds: [embed] });
  }

});

client.login(process.env.DISCORD_TOKEN);
