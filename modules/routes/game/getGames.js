import express from 'express'
import db from '../../db/db.js';

const router = express.Router();

router.get("/:theme", async (req, res) => {
  const theme = req.params.theme;
  const { search_keyword, difficulty, limit, offset, filter } = req.query;
  let datas = [];
  // console.log('sk',search_keyword, 'df', difficulty, 'nm', Number(difficulty))
  try {
    if (difficulty === 'null') {
      // console.log('if')
      const [rows] = await db.query(`SELECT * FROM game WHERE theme = ? AND title LIKE ? AND visibility = 'public' ORDER BY ${filter} LIMIT ? OFFSET ?;`,
        [
          theme,
          `%${search_keyword}%`,
          Number(limit),
          Number(offset)
        ]
      );
      datas = rows;
    } else {
      // console.log('else')
      const [rows] = await db.query(`SELECT * FROM game WHERE theme = ? AND title LIKE ? AND difficulty = ? AND visibility = 'public' ORDER BY ${filter} LIMIT ? OFFSET ?;`,
        [
          theme,
          `%${search_keyword}%`,
          Number(difficulty),
          Number(limit),
          Number(offset)
        ]
      );
      datas = rows;
    }
    // console.log(rows)
    res.json(datas)
    // console.log(rows)
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;