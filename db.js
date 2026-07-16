// db.js 数据库连接池
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql6.sqlpub.com',
  port: parseInt(process.env.MYSQL_PORT || '3311'),
  user: process.env.MYSQL_USER || 'zzyyulin',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'zzyyulin',
  charset: 'utf8mb4'
});
module.exports = pool;
