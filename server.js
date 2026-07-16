const express = require('express');
const cors = require('cors');
const pool = require('./db');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 【编码修复】强制所有接口响应使用 UTF-8 字符集
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

// 原创歌曲接口
app.get('/api/original', async (req, res) => {
  try {
    const [list] = await pool.query(`
      SELECT audio_name, cover_img, audio_url 
      FROM audio WHERE audio_type = 1 
      ORDER BY sort ASC
    `);
    res.json({ code: 200, data: list });
  } catch (err) {
    res.json({ code: 500, msg: '加载原创歌曲失败' });
  }
})

// 翻唱歌曲接口（完整无遗漏）
app.get('/api/cover', async (req, res) => {
  try {
    const [list] = await pool.query(`
      SELECT audio_name, cover_img, audio_url 
      FROM audio WHERE audio_type = 2 
      ORDER BY sort ASC
    `);
    res.json({ code: 200, data: list });
  } catch (err) {
    res.json({ code: 500, msg: '加载翻唱歌曲失败' });
  }
})

// 留言接口保留
app.get('/api/message', async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM message ORDER BY id DESC LIMIT 50");
    res.json({ code: 200, data: rows });
  } catch (err) {
    res.json({ code: 500, msg: "读取留言失败" })
  }
})

app.post('/api/addMsg', async (req, res) => {
  const { nick_name, msg_text } = req.body;
  if (!nick_name || !msg_text) return res.json({ code: 400, msg: "昵称和留言不能为空" });
  if (nick_name.length > 15) return res.json({ code: 400, msg: "昵称不能超过15个字" });
  if (msg_text.length > 40) return res.json({ code: 400, msg: "留言不能超过40个字" });
  try {
    await pool.query("INSERT INTO message(nick_name,msg_text) VALUES (?,?)", [nick_name, msg_text]);
    const [countRes] = await pool.query("SELECT COUNT(*) AS total FROM message");
    const total = countRes[0].total;
    if (total > 50) {
      const delNum = total - 50;
      await pool.query(`DELETE FROM message ORDER BY id ASC LIMIT ${delNum}`);
    }
    res.json({ code: 200, msg: "留言发布成功" });
  } catch (err) {
    res.json({ code: 500, msg: "留言失败" });
  }
})

app.listen(port, () => {
  console.log(`服务已启动 http://127.0.0.1:3000`);
});