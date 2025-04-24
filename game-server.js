import express from 'express'
import mysql from 'mysql2'
import 'dotenv/config'
import cors from 'cors'
import fs from 'fs'
import { fileURLToPath } from 'url';
import path from 'path';
import uploadZipRouter from './modules/routes/uploadZIPGameToServer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 처리

// MySQL 연결
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  port: "3400",
  password: "0000",
  database: "sherlock",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL 연결 실패: ", err);
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
      const path = `serverDB/games/${game_id}`;
      const data = JSON.stringify(game, null, 2);
      fs.mkdirSync(path, { recursive: true })
      fs.writeFileSync(path+'/game.json', data)
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
      const data = JSON.stringify(game, null, 2);
      fs.writeFileSync(path, data, (err) => {
        if(err) {
          console.error('파일 수정 실패: ', err);
          return;
        } else console.log('파일 수정 완료!')
      })
    }
  });
});

// 게임 테이터 가져오기기
app.get("/game/:theme", (req, res) => {
//   console.log(`파람들: ${req.params}\n쿼리들: ${req.query}`);
  const theme = req.params.theme;
  const limit = Number(req.query.limit);
  const offset = Number(req.query.offset);
  db.query(`SELECT * FROM game WHERE theme = ? AND visibility = 'public' ORDER BY created_at LIMIT ? OFFSET ?;`, [theme, limit, offset], (err, results) => {
    const newData = [];
    results.map((data, index) => {
        let gameId = data.game_id;
        let game = JSON.parse(fs.readFileSync(`server/games/${gameId}/game.json`))
        console.log(game)
        let title = game.title
        let thumbnail = `${gameId}/${game.thumbnailURL}`
        newData.push({...data, title: title, thumbnail: thumbnail})
    })
    console.log('results: ', results)
    console.log('newData: ', newData)
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(newData);
    }
  });
});


// 필요한 폴더 생성
['games', 'temp'].forEach((dir) => {
  const fullPath = path.join(__dirname, 'server', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
  }
});

app.use('/workspace-files/:game_id', uploadZipRouter);
app.post('/workspace-files/:game_id', (req, res) => {
  const gameId = req.params.game_id;
  const userId = "gourn"
  const theme = req.query.theme;
  const visibility = req.query.visibility;
  db.query(`INSERT INTO game (game_id, user_id, theme, visibility) VALUES (?, ?, ?, ?);`, [gameId, userId, theme, visibility], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.json(results);
    }
  })
})
app.put('/workspace-files/:game_id', (req, res) => {
  const gameId = req.params.game_id;
  const theme = req.query.theme;
  const visibility = req.query.visibility;
  db.query(`UPDATE game SET updated_at = CURRENT_TIMESTAMP, theme = ?, visibility = ? WHERE game_id = ?;`, [theme, visibility, gameId], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    } else {
      return res.json(results);
    }
  })
})


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



const port = '4000';
app.listen(port, () => {
  console.log(`게임서버 실행 중··· (포트: ${port})`);
});