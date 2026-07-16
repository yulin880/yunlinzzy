const mysql = require('mysql2/promise');

// 数据库连接池
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'mysql6.sqlpub.com'
  port: parseInt(process.env.MYSQL_PORT || '3311'),
  user: process.env.MYSQL_USER || 'zzyyulin',
  password: process.env.MYSQL_PASSWORD || '6DOGfz4fStKdMBFH',
  database: process.env.MYSQL_DATABASE || 'zzyyulin',
  charset: 'utf8mb4'
});

exports.handler = async (event, context) => {
  const path = event.path.replace(/^\/api\//, '');
  
  const queryParams = event.queryStringParameters || {};
  
  // 设置 CORS 头
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8'
  };

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // 原创歌曲接口
    if (path === 'original' && event.httpMethod === 'GET') {
      const [list] = await pool.query(
        SELECT audio_name, cover_img, audio_url 
        FROM audio WHERE audio_type = 1 
        ORDER BY sort ASC
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ code: 200, data: list })
      };
    }

    // 翻唱歌曲接口
    if (path === 'cover' && event.httpMethod === 'GET') {
      const [list] = await pool.query(
        SELECT audio_name, cover_img, audio_url 
        FROM audio WHERE audio_type = 2 
        ORDER BY sort ASC
      );
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ code: 200, data: list })
      };
    }

    // 留言列表接口
    if (path === 'message' && event.httpMethod === 'GET') {
      const [rows] = await pool.query('SELECT * FROM message ORDER BY id DESC LIMIT 50');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ code: 200, data: rows })
      };
    }

    // 添加留言接口
    if (path === 'addMsg' && event.httpMethod === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const { nick_name, msg_text } = body;
      
      if (!nick_name || !msg_text) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ code: 400, msg: '昵称和留言不能为空' })
        };
      }
      if (nick_name.length > 15) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ code: 400, msg: '昵称不能超过15个字' })
        };
      }
      if (msg_text.length > 40) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ code: 400, msg: '留言不能超过40个字' })
        };
      }
      
      await pool.query('INSERT INTO message(nick_name,msg_text) VALUES (?,?)', [nick_name, msg_text]);
      const [countRes] = await pool.query('SELECT COUNT(*) AS total FROM message');
      const total = countRes[0].total;
      
      if (total > 50) {
        const delNum = total - 50;
        await pool.query(DELETE FROM message ORDER BY id ASC LIMIT ?, [delNum]);
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ code: 200, msg: '留言发布成功' })
      };
    }

    // 未找到路由
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ code: 404, msg: 'API 路由未找到' })
    };

  } catch (err) {
    console.error('Serverless Function Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ code: 500, msg: '服务器内部错误' })
    };
  } finally {
    // 关闭数据库连接
    await pool.end().catch(() => {});
  }
};
