module.exports = {
  name: 'avatar',
  description: 'Displays the avatar of the user.',
  execute(message, args) {
    if (!message.mentions.users.size) {
      return message.channel.send(`Your avatar: ${message.author.displayAvatarURL({ dynamic: true })}`);
    }

    const avatarList = message.mentions.users.map(user => {
      return `${user.username}'s avatar: ${user.displayAvatarURL({ dynamic: true })}`;
    });

    message.channel.send(avatarList);
  },
};
