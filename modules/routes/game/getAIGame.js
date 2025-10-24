import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: 'modules/db/.env' });

const router = express.Router();
const genaAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

// const fileUrl = 'C:/Users/user11/Downloads/Stage2v3.zip'

// router.get("/", async (req, res) => {
//   console.log('get/ai_game query', req.query);
//   if (!fs.existsSync(fileUrl)) {
//     return res.status(404).send('파일이 존재하지 않습니다.');
//   }
//   try {
//     const readStream = fs.createReadStream(fileUrl);
//     res.setHeader('Content-Type', 'application/zip');
//     readStream.pipe(res);
//     console.log('만들어진 게임 잘 전송됨');
//   } catch (err) {
//     console.log('실패')
//     res.status(500).send(err);
//   }
// });

router.get("/analyzing", async (req, res) => {
  const { prompt } = req.query;
  try {
    if (!prompt) return res.status(400).json({ error: '프롬프트를 입력해주세요.' });

    const systemPrompt = `
    `;

    const response = await genaAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: []
    })
  } catch (err) {
    console.log('실패')
    res.status(500).send(err);
  }
});
router.get("/designing", async (req, res) => {
  try {
  } catch (err) {
    console.log('실패')
    res.status(500).send(err);
  }
});
router.get("/drawing", async (req, res) => {
  try {
  } catch (err) {
    console.log('실패')
    res.status(500).send(err);
  }
});
router.get("/creating", async (req, res) => {
  try {
    const readStream = fs.createReadStream();
    res.setHeader('Content-Type', 'application/zip');
    readStream.pipe(res);
    console.log('게임 전송');
  } catch (err) {
    console.log('실패')
    res.status(500).send(err);
  }
});

export default router;