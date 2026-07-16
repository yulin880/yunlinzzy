const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql6.sqlpub.com',
  port: parseInt(process.env.MYSQL_PORT || '3311'),
  user: process.env.MYSQL_USER || 'zzyyulin',
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE || 'zzyyulin',
  charset: 'utf8mb4'
});

exports.handler = async (event, context) => {
  const path = event.path.replace(/^\//, '').replace(/^api\//, '');
  console.log('DEBUG: path=' + path + ', method=' + event.httpMethod);
  console.log('DEBUG: MYSQL_HOST=' + process.env.MYSQL_HOST);
  console.log('DEBUG: MYSQL_PASSWORD=' + (process.env.MYSQL_PASSWORD ? 'SET' : 'NOT SET'));

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    if (path === 'original' && event.httpMethod === 'GET') {
      const q1 = "SELECT audio_name, cover_img, audio_url FROM audio WHERE audio_type = 1 ORDER BY sort ASC";
      const [list] = await pool.query(q1);
      return { statusCode: 200, headers, body: JSON.stringify({ code: 200, data: list }) };
    }

    if (path === 'cover' && event.httpMethod === 'GET') {
      const q2 = "SELECT audio_name, cover_img, audio_url FROM audio WHERE audio_type = 2 ORDER BY sort ASC";
      const [list] = await pool.query(q2);
      return { statusCode: 200, headers, body: JSON.stringify({ code: 200, data: list }) };
    }

    if (path === 'message' && event.httpMethod === 'GET') {
      const [rows] = await pool.query("SELECT * FROM message ORDER BY id DESC LIMIT 50");
      return { statusCode: 200, headers, body: JSON.stringify({ code: 200, data: rows }) };
    }

    if (path === 'addMsg' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { nick_name, msg_text } = body;

      if (!nick_name || !msg_text) {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 400, msg: '昵称和留言不能为空' }) };
      }
      if (nick_name.length > 15) {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 400, msg: '昵称不能超过15个字' }) };
      }
      if (msg_text.length > 40) {
        return { statusCode: 400, headers, body: JSON.stringify({ code: 400, msg: '留言不能超过40个字' }) };
      }

      await pool.query("INSERT INTO message(nick_name,msg_text) VALUES (?,?)", [nick_name, msg_text]);
      const [countRes] = await pool.query("SELECT COUNT(*) AS total FROM message");
      const total = countRes[0].total;

      if (total > 50) {
        const delNum = total - 50;
        const q3 = "DELETE FROM message ORDER BY id ASC LIMIT ?";
        await pool.query(q3, [delNum]);
      }

      return { statusCode: 200, headers, body: JSON.stringify({ code: 200, msg: '留言发布成功' }) };
    }

    return { statusCode: 404, headers, body: JSON.stringify({ code: 404, msg: 'API 路由未找到' }) };

  } catch (err) {
    console.error('ERROR:', err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ code: 500, msg: '服务器内部错误: ' + err.message }) };
  }
};