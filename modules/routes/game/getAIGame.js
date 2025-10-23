import express from 'express';
import fs from 'fs';

const router = express.Router();

const fileUrl = 'C:/Users/user11/Downloads/Stage2v3.zip'

router.get("/", async (req, res) => {
  console.log('get/ai_game query', req.query);
  if (!fs.existsSync(fileUrl)) {
    return res.status(404).send('파일이 존재하지 않습니다.');
  }
  try {
    const readStream = fs.createReadStream(fileUrl);
    res.setHeader('Content-Type', 'application/zip');
    readStream.pipe(res);
    console.log('잘 보냈음');
  } catch (err) {
    console.log('실패')
    res.status(500).send(err);
  }
})

export default router;