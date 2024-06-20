const { MessageEmbed } = require('discord.js');
const fs = require("fs");

module.exports = {
    name: `unban`,
    description: `Unbans given user ID or mentioned user.`,
    async execute(bot, args, message) {

        if (!message.member.hasPermission(["BAN_MEMBERS"])) return message.channel.send("You do not have the required permissions to use the unban command.")

        if (!args[0]) return message.channel.send("Provide me a valid USER ID.");
        //This if() checks if we typed anything after "!unban"

        let bannedMember;
        //This try...catch solves the problem with the await
        try {
            bannedMember = await bot.users.cache.fetch(args[0])
        } catch (e) {
            if (!bannedMember) return message.channel.send("That's not a valid USER ID.")
        }

        //Check if the user is not banned
        try {
            await message.guild.fetchBan(args[0])
        } catch (e) {
            message.channel.send('This user is not banned.');
            return;
        }

        let reason = args.slice(1).join(" ")
        if (!reason) reason = "No reason provided."

        if (!message.guild.me.hasPermission(["BAN_MEMBERS"])) return message.channel.send("I am missing permissions to unban.")
        message.delete()
        try {
            message.guild.members.unban(bannedMember, { reason: reason })
            message.channel.send(`${bannedMember.tag} has been unbanned.`)
            console.log(`AUDIT LOG: [UNBAN] ${message.author.tag} unbanned ${member.user.tag} from ${message.guild.name}.`);
            var readmessagefile = fs.readFileSync('./logging/UnbanLog.txt', 'utf-8');
            var writemessagefile = fs.writeFileSync('./logging/UnbanLog.txt', 'Type: [UNBAN] ' + 'Time ' + '(' + message.createdAt + ')' + ' | ' + member.user.tag + ' from ' + message.guild.name + ' | Moderator ' + message.author.tag + '\n' + readmessagefile)
            console.log('BOT LOG: [INTERNAL] Writing to unban log file.');
        } catch (e) {
            console.log(e.message)
        }
    }
}
