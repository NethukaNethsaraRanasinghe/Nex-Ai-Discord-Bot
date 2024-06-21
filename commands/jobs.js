const jobs = ['Developer', 'Doctor', 'Teacher', 'Engineer', 'Artist'];

module.exports = {
  name: 'job',
  description: 'Get a randomized job.',
  async execute(message, args) {
    const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
    message.reply(`Your job is now: ${randomJob}. You can use !work to earn money.`);
  },
};
