// .. routes/notice.js

import express from 'express';
const router = express.Router();
import db from '../db/db.js'; // DB 연결 설정

// 공지사항 목록 불러오기 (페이징)
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;  // 페이지 기본값은 1
  const limit = 10;  // 한 페이지에 표시할 공지사항 개수
  const offset = (page - 1) * limit;  // 페이지에 맞게 offset 계산

  try {
    // 공지사항 목록을 가져오는 쿼리
    const [rows] = await db.query(`
      SELECT n.notice_id, n.title, n.created_at, u.user_name AS admin_name
      FROM notice n
      JOIN userinfo u ON n.admin_id = u.user_id
      WHERE u.deleted = 0  -- 삭제되지 않은 사용자만
      ORDER BY n.created_at DESC  -- 최신순으로 정렬
      LIMIT ? OFFSET ?  -- 페이징 처리
    `, [limit, offset]);

    // 로그 추가: rows가 제대로 조회되는지 확인
    console.log('공지사항 목록:', rows);

    res.json({
      status: 'success',
      data: rows // rows가 올바른 데이터인지 확인
    });
    
  } catch (error) {
    console.error(error);
    res.status(500).send('공지사항을 불러오는 중 오류가 발생했습니다.');
  }
});


// 공지사항 상세 정보 가져오기
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.query(`
      SELECT notice_id, title, content, created_at, updated_at
      FROM notice
      WHERE notice_id = ?
    `, [id]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send('공지사항을 찾을 수 없습니다.');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('공지사항을 불러오는 중 오류가 발생했습니다.');
  }
});


export default router;
