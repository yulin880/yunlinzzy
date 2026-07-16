// db.js 数据库连接池，填入你的SQLPub参数
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
  host: "mysql6.sqlpub.com",
  port: 3311,
  user: "zzyyulin",
  password: "6DOGfz4fStKdMBFH",
  database: "zzyyulin",
  charset: "utf8mb4"
});
module.exports = pool;