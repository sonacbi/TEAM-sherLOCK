import express from 'express'
import db from '../../db/db.js';
import fs from 'fs'

const router = express.Router();

router.get("/:game_id", async (req, res) => {
  const gameId = req.params.game_id;
  console.log('param', req.params.game_id)
  try {
    const [rows] = await db.query(`SELECT * FROM game WHERE game_id = ?;`, [gameId]);
    const data = rows[0];
    console.log(data)
    const file = fs.readFileSync(`server/games/${gameId}/game.json`)
    const json = JSON.parse(file);
    const game = { ...json, data}
    // game.data = rows[0]
    // const imgPaths = [game.thumbnailURL];
    // game.stage.map((data, index) => {
    //   data.imgURL
    // })
    console.log(game)
    res.json(game);
  } catch (err) {
    res.status(500).send(err);
  }
})

export default router;