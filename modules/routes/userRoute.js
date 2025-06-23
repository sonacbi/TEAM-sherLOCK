import express from 'express';
import UserDAO from '../DAO/userDAO.js'; // DAO 경로 확인 필요

const router = express.Router();

// 유저 ID로 유저 정보 조회
router.get('/:user_id', async (req, res) => {
  try {
    const user = await UserDAO.findById(req.params.user_id);
    if (user) {
      res.json({ user_name: user.user_name });
    } else {
      res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
    }
  } catch (error) {
    console.error('유저 조회 에러:', error);
    res.status(500).json({ error: '서버 오류' });
  }
});

export default router;
