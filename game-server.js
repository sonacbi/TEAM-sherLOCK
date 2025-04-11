import express from 'express'
import mysql from 'mysql2'
import 'dotenv/config'
import cors from 'cors'
import fs from 'fs'

const app = express();
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 처리

// MySQL 연결
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: process.env.DB_PW,
  database: "sherlock",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패:", err);
  } else {
    console.log("MySQL 연결 성공!");
  }
});

// 워크스페이스
app.post("/workspace", (req, res) => {
  console.log('post 요청받은 게임데이터: ', req.body)
  const game_id = req.body.game_id;
  const user_id = req.body.user_id;
  // DB 연동
  db.query(`INSERT INTO game (game_id, user_id) VALUES (?, ?);`, [game_id, user_id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
      // 서버에 게임 파일 저장하기
      const game = req.body.game;
      const path = `serverDB/games/${game_id}.json`;
      const data = JSON.stringify({game}, null, 2);
      fs.writeFileSync(path, data, (err) => {
        if(err) {
          console.error('파일 쓰기 실패: ', err);
          return;
        } else console.log('파일 쓰기 완료!')
      })
    }
  });
});
app.put("/workspace", (req, res) => {
  console.log('put 요청받은 게임데이터: ', req.body)
  const game_id = req.body.game.id;
  // DB 연동
  db.query(`UPDATE game SET updated_at = CURRENT_TIMESTAMP WHERE game_id = ?;`, [game_id], (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
      // 서버에 게임 파일 저장하기
      const game = req.body.game;
      const path = `serverDB/games/${game_id}.json`;
      const data = JSON.stringify({game}, null, 2);
      fs.writeFileSync(path, data, (err) => {
        if(err) {
          console.error('파일 수정 실패: ', err);
          return;
        } else console.log('파일 수정 완료!')
      })
    }
  });
});



// ^^^^^^^^ 테 스 트 ^^^^^^^^
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
// vvvvvvvv 테 스 트 vvvvvvvv



const port = process.env.GAME_SERVER_PORT;
app.listen(port, () => {
  console.log(`게임서버 실행 중··· (포트: ${port})`);
});