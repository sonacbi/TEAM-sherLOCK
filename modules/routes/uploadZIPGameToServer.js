import express from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// 임시 저장 폴더
const upload = multer({ dest: path.join('server/temp/') });

router.all('/', upload.single('zipfile'), (req, res, next) => {
  console.log('파일',req.file)
  console.log('param',req.params)
  // console.log('파일',req)
  try {
    const zipPath = req.file.path;
    const zip = new AdmZip(zipPath);
    
    const entries = zip.getEntries();
    
    const jsonEntry = entries.find((e) => e.entryName.endsWith('.json'));
    const jsonData = JSON.parse(jsonEntry.getData().toString('utf-8'));
    
    if (!jsonEntry) {
      return res.status(400).json({ message: 'ZIP 안에 JSON 파일이 없습니다.' });
    }
    
    const extractFolder = path.join('server/games', jsonData.id);
    zip.extractAllTo(extractFolder, true);
    
    // fs.writeFileSync('server/games/'+jsonData.id+'/.zip', req.file.path)
    fs.copyFileSync(req.file.path, 'server/games/' + jsonData.id + '/game.zip');
    
    const imageFiles = fs.readdirSync(extractFolder).filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    // return res.json({
    //   message: 'ZIP 처리 성공!',
    //   json: jsonData,
    //   images: imageFiles,
    // });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 에러', error: err.message });
  } finally {
    // 임시 파일 삭제
    fs.unlink(req.file.path, () => {});
    next();
  }
});
// router.post('/', )

export default router;
