import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import fs from 'fs';
import db from '../../db/db.js';

const router = express.Router();

// 임시 저장 폴더
const upload = multer({ dest: 'server/temp/' });

// 모든 경로에 해당
router.all('/:game_id', upload.single('zipfile'), (req, res, next) => {
  console.log('파일',req.file)
  console.log('param',req.params)
  // console.log('파일',req)
  const gameId = req.params.game_id
  const { type } = JSON.parse(req.body.gameInfo);
  try {
    const zipPath = req.file.path;
    const zip = new AdmZip(zipPath);
    
    const entries = zip.getEntries();
    
    const jsonEntry = entries.find((e) => e.entryName.endsWith('.json'));
    
    if (!jsonEntry) {
      return res.status(400).json({ message: 'ZIP 안에 JSON 파일이 없습니다.' });
    }
    
    zip.extractAllTo(`server/games/${type}/${gameId}`, true);
    
    fs.copyFileSync(zipPath, `server/games/${type}/${gameId}/game.zip`);

    console.log("🎉서버에 게임파일이 저장되었습니다!")
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 에러', error: err.message });
  } finally {
    // 임시 파일 삭제
    fs.unlink(req.file.path, () => {});
    next();
  }
});
router.post('/:game_id', async (req, res) => {
  const gameId = req.params.game_id;
  const userId = "admin01"
  const {title, thumbnail, theme, type, visibility, description, difficulty, playTime, isRanking, isHiddenStage} = JSON.parse(req.body.gameInfo)
  try {
    await db.query("INSERT INTO game (game_id, user_id, title, thumbnail, theme, type, visibility, description, difficulty, playTime, isLanking, isHiddenStage) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
      [gameId, userId, title, thumbnail, theme, type, visibility, description, difficulty, playTime, isRanking, isHiddenStage])
  } catch (err) {
    return res.status(500).send(err);
  }
})
router.put('/:game_id', async (req, res) => {
  const gameId = req.params.game_id;
  const {title, thumbnail, theme, type, visibility, description, difficulty, playTime, isRanking, isHiddenStage} = JSON.parse(req.body.gameInfo)
  try {
    await db.query("UPDATE game SET updated_at = CURRENT_TIMESTAMP, title = ?, thumbnail = ?, theme = ?, type = ? visibility = ?, description = ?, difficulty = ?, playTime = ?, isLanking = ?, isHiddenStage = ? WHERE game_id = ?;",
      [title, thumbnail, theme, type, visibility, description, difficulty, playTime, isRanking, isHiddenStage, gameId])
  } catch (err) {
    return res.status(500).send(err);
  }
})


export default router;
