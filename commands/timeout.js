module.exports = {
  name: 'timeout',
  description: 'Timeouts a user (admin only).',
  execute(message, args) {
    // Check if the user is an administrator
    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('You do not have permission to use this command.');
    }

    // Validate the user mentioned
    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Please mention the user to timeout.');
    }

    // Fetch the timeout duration (in minutes)
    const timeoutDuration = parseInt(args[1]);
    if (isNaN(timeoutDuration) || timeoutDuration <= 0) {
      return message.reply('Please provide a valid timeout duration in minutes (greater than 0).');
    }

    // Calculate timeout end time
    const timeoutEndTime = new Date(Date.now() + timeoutDuration * 60000); // Convert minutes to milliseconds

    // Timeout the user
    member.roles.add('YOUR_TIMEOUT_ROLE_ID')
      .then(() => {
        message.channel.send(`${member.user.tag} has been timed out for ${timeoutDuration} minutes.`);

        // Remove timeout role after specified time
        setTimeout(() => {
          member.roles.remove('YOUR_TIMEOUT_ROLE_ID')
            .catch(error => console.error('Error removing timeout role:', error));
        }, timeoutDuration * 60000);
      })
      .catch(error => {
        console.error('Error timing out user:', error);
        message.reply('Failed to timeout the user. Please try again later.');
      });
  },
};
