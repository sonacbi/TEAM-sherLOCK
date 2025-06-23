import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

// .env값 불러오기
import dotenv from 'dotenv';
dotenv.config({ path: './modules/db/.env' });

// authRoutes : 회원가입&로그인 관련 라우트
import authRoutes from './modules/routes/authRoutes.js';

// notice : 공지사항 관련 라우트
import noticeRoute from './modules/routes/notice.js';

// 유저 정보 라우트 추가
import userRoute from './modules/routes/userRoute.js';

const app = express();
app.use(express.json());

const corsOptions = {
  origin: 'http://localhost:5173', // 허용할 origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // 요청 헤더에 대한 허용
  credentials: true, // 필요 시 추가
};

import { User } from './modules/user/mypage/userinfo_modules.js'; // 유저 객체 생성용 임포트

app.use(cors(corsOptions)); // CORS 설정 추가

// app.use(cors()); // 모든 포트에서 요청을 받음
app.use(bodyParser.json()); // post 해석

// 라우트 연결
// 1. 회원가입-로그인 관련 라우트
app.use('/auth', authRoutes);
// 2. 공지사항 관련 라우트
app.use('/api/notices', noticeRoute);
// 3. 유저 검색용 라우트
app.use('/api/user', userRoute);

/* ---------------------------------------------------------------------- */


// 서버 실행
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`User server : http://localhost:${PORT}`);
});
