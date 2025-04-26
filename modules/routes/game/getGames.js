import express from 'express'
import db from '../../db/db.js';
import fs from 'fs'

const router = express.Router();

router.get("/:theme", async (req, res) => {
  const theme = req.params.theme;
  const limit = Number(req.query.limit);
  const offset = Number(req.query.offset);
  const search_word = req.query.search_word;
  try {
    const [rows] = await db.query(`SELECT * FROM game WHERE theme = ? AND visibility = 'public' ORDER BY created_at LIMIT ?;`, [theme, limit])
    const newData = [];
    rows.map((data, index) => {
      const gameId = data.game_id;
      const game = JSON.parse(fs.readFileSync(`server/games/${gameId}/game.json`));
      // console.log(game);
      newData.push({
        ...data,
        title: game.title,
        thumbnail: `${gameId}/${game.thumbnailURL}`,
        difficulty: game.difficulty
      });
    })
    res.json(newData)
    // console.log(rows)
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;