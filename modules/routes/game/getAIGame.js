import express from 'express';
import fs from 'fs';

const router = express.Router();

const fileUrl1 = 'C:/Users/user11/Downloads/SRP.zip'
const fileUrl2 = 'C:/Users/user11/Downloads/park.zip'
let num = 0;

router.get("/", async (req, res) => {
  console.log('get/ai_game query', req.query);
  if (!fs.existsSync(fileUrl1) || !fs.existsSync(fileUrl2)) {
    return res.status(404).send('파일이 존재하지 않습니다.');
  }
  try {
    const fileUrl = num % 2 === 0 ? fileUrl1 : fileUrl2;
    const readStream = fs.createReadStream(fileUrl);
    res.setHeader('Content-Type', 'application/zip');
    readStream.pipe(res);
    num++;
    console.log('잘 보냈음');
  } catch (err) {
    console.log('실패')
    res.status(500).send(err);
  }
})

export default router;