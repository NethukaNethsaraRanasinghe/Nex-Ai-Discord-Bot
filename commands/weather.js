const fetch = require('node-fetch');

module.exports = {
  name: 'weather',
  description: 'Gets weather information for a specified city.',
  async execute(message, args) {
    if (!args.length) return message.reply('Please provide a city name.');

    const city = args.join(' ');
    const apiKey = 'YOUR_API_KEY'; // Replace with your OpenWeather API key
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.cod === '404') {
        return message.reply('City not found.');
      }

      const weatherInfo = `
        **Weather in ${data.name}:**
        Temperature: ${data.main.temp}°C
        Humidity: ${data.main.humidity}%
        Condition: ${data.weather[0].description}
      `;

      message.channel.send(weatherInfo);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      message.reply('Failed to fetch weather data. Please try again later.');
    }
  },
};
