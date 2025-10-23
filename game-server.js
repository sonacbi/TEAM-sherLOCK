import express from 'express'
import cors from 'cors'
import fs from 'fs'
import getGame from './modules/routes/game/getGame.js';
import getGames from './modules/routes/game/getGames.js';
import getAIGame from './modules/routes/game/getAIGame.js';
import uploadGameRoute from './modules/routes/game/uploadGame.js';
import uploadGameAll from './modules/routes/game/uploadGameAll.js';

const app = express();
app.use(cors()); // CORS 허용
app.use(express.json()); // JSON 요청 처리

app.use('/game', getGame); // 게임 테이터 가져오기 (단일)
app.use('/games', getGames); // 게임 데이터 가져오기 (테마 페이지)
app.use('/ai_game', getAIGame); // AI가 만든 게임 파일 가져오기

app.use('/workspace', uploadGameRoute); // 워크스페이스에서 만든 게임 파일을 서버에 업로드
app.use('/editor', uploadGameAll); // 에디터에서 만든 게임 파일을 서버에 업로드

const port = '4000';
app.listen(port, () => {
  console.log(`Game server : http://localhost:${port}`);
});