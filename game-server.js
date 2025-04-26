import express from 'express'
import mysql from 'mysql2'
import cors from 'cors'
import fs from 'fs'
import { fileURLToPath } from 'url';
import path from 'path';
import getGame from './modules/routes/game/getGame.js';
import getGames from './modules/routes/game/getGames.js';
import uploadGameRoute from './modules/routes/game/uploadGame.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 처리

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

// 게임 테이터 가져오기
app.use('/game', getGame);
app.use('/games', getGames);

// 필요한 폴더 생성
['games', 'temp'].forEach((dir) => {
  const fullPath = path.join(__dirname, 'server', dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath);
  }
});

// 워크스페이스에서 만든 게임 파일을 서버에 저장
app.use('/workspace-files', uploadGameRoute);


const port = '4000';
app.listen(port, () => {
  console.log(`Game server : http://localhost:${port}`);
});