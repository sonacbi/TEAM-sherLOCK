// require("dotenv").config();
// import 'dotenv/config'
import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import fs from 'fs'

const app = express();
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 처리

// MySQL 연결
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "025712",
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
app.post("/workspace", (req, res) => {
  console.log('게임 db req: ',req.body)
  const game_id = req.body.game_id;
  const user_id = req.body.user_id;
  db.query(`INSERT INTO game (game_id, user_id) VALUES (?, ?);`, [game_id, user_id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
      const game = req.body.game;
      const path = `serverDB/games/${game_id}.json`;
      const data = JSON.stringify({game}, null, 2);
      fs.writeFileSync(path, data, (err) => {
        if(err) {
          console.error('파일 쓰기 실패: ', err);
          return;
        } else console.log('파일 쓰기 완료')
      })
    }
  });
});
app.put("/workspace", (req, res) => {
  console.log('게임 db req: ',req.body)
  const game_id = req.body.game.id;
  db.query(`UPDATE game SET updated_at = CURRENT_TIMESTAMP WHERE game_id = ?;`, [game_id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
      const game = req.body.game;
      const path = `serverDB/games/${game_id}.json`;
      const data = JSON.stringify({game}, null, 2);
      fs.writeFileSync(path, data, (err) => {
        if(err) {
          console.error('파일 쓰기 실패: ', err);
          return;
        } else console.log('파일 수정 완료')
      })
    }
  });
});

app.listen(5000, () => {
  console.log("서버 실행 중 (포트 5000)");
});