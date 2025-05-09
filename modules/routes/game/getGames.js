import express from 'express'
import db from '../../db/db.js';
import fs from 'fs'

const router = express.Router();

router.get("/:theme", async (req, res) => {
  const theme = req.params.theme;
  const search_keyword = `%${req.query.search_keyword}%`;
  const limit = Number(req.query.limit);
  const offset = Number(req.query.offset);
  try {
    const [rows] = await db.query("SELECT * FROM game WHERE theme = ? AND title LIKE ? AND visibility = 'public' ORDER BY created_at LIMIT ? OFFSET ?;", [theme, search_keyword, limit, offset])
    res.json(rows)
    // console.log(rows)
  } catch (err) {
    res.status(500).send(err);
  }
});

export default router;