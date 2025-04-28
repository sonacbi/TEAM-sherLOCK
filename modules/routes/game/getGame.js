import express from 'express'
import db from '../../db/db.js';
import fs from 'fs'

const router = express.Router();

router.get("/:game_id", async (req, res) => {
  const gameId = req.params.game_id;
  try {
    const [rows] = await db.query(`SELECT * FROM game WHERE game_id = ?`, [gameId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
})
router.get("/:game_id/zip", async (req, res) => {
  const gameId = req.params.game_id;
  try {
    const readStream = fs.createReadStream(`server/games/${gameId}/game.zip`);
    res.setHeader('Content-Type', 'application/zip');
    readStream.pipe(res);
  } catch (err) {
    console.log('실패')
    res.status(500).send(err);
  }
})

export default router;