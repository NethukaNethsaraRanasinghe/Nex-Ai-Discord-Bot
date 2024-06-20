const Discord = require('discord.js');

module.exports = {
    name: "unban",
    description: "Unbans a member from the server",
    async run(client, message, args) {
        if (!message.member.hasPermission("BAN_MEMBERS")) return message.channel.send('You can\'t use that!');
        if (!message.guild.me.hasPermission("BAN_MEMBERS")) return message.channel.send('I don\'t have the permissions.');

        // Get the user ID to unban (you can use args[0] or any other method)
        const userId = args[0];

        // Fetch the banned users
        const bannedUsers = await message.guild.bans.fetch();
        const bannedUser = bannedUsers.get(userId);

        if (!bannedUser) return message.channel.send('User not found or not banned.');

        // Unban the user
        message.guild.members.unban(userId, 'Unban reason here')
            .then(() => {
                const unbanEmbed = new Discord.MessageEmbed()
                    .setTitle('Member Unbanned')
                    .addField('User Unbanned', `<@${userId}>`)
                    .addField('Unbanned by', message.author)
                    .addField('Reason', 'Unban reason here')
                    .setFooter('Time Unbanned', client.user.displayAvatarURL())
                    .setTimestamp();

                message.channel.send(unbanEmbed);
            })
            .catch(err => {
                console.error(err);
                message.channel.send('Something went wrong while unbanning the user.');
            });
    }
};
