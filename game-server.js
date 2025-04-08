// require("dotenv").config();
// import 'dotenv/config'
import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'

const app = express();
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 처리

// MySQL 연결
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "0000",
  database: "sherlock",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
  } else {
    console.log("MySQL 연결 성공!");
  }
});



// 게임 테이블 조회
app.get("/game/:num", (req, res) => {
  console.log("게임 아이디:", req.params.num);
  const num = Number(req.params.num);
  console.log(num)
  db.query(`SELECT * FROM game WHERE game_id = ?;`, [num], (err, results) => {
    console.log('results: ', results)
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

app.post("/data", (req, res) => {
  const sql = req.body.query;
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

app.listen(5000, () => {
  console.log("서버 실행 중 (포트 5000)");
});