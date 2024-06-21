const mysql = require('mysql');

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'your_database_host',
  user: 'your_database_username',
  password: 'your_database_password',
  database: 'your_database_name'
});

module.exports = pool;
