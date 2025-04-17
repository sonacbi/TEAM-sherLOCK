// modules/routes/authRoutes.js
import express from 'express';
import bcrypt from 'bcrypt';
import axios from 'axios';
import UserDAO from '../DAO/userDAO.js';
import { issueToken } from './userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

/* ------------------회원가입------------------ */
router.post('/signup', async (req, res) => {
  try{
      /* console.log('📦 받은 요청 데이터:', req.body); // 이 줄 추가해서 확인 */
  
      // 평문 비밀번호 꺼내기
      const plainPassword = req.body.user_pw;
  
      // 해싱 (10은 saltRounds, 너무 높게 하면 느려짐)
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
      const user = {
        ...req.body, // post로 보낸 값을 받음
        user_pw: hashedPassword,  // 해시된 비밀번호로 대체
        created_at: new Date(),
        updated_at: new Date(),
        deleted: 0,
        user_social_stringified : null,
        profile_url : 'default'
      };
      await UserDAO.insertUser(user);
    res.status(201).json({ meesage : '회원가입 성공!'});

  } catch(err) {
    console.error(err);
    res.status(500).json({ error : '회원가입 중 오류 발생'});
  }
});

/* ------------------중복 확인------------------ */
router.post('/duplicated', async (req, res) => {
  const { user_id, user_name, user_email, duple_type } = req.body;
  let user = '';
  try {
    switch (duple_type) {
      case 'userId':
        user = await UserDAO.findById(user_id);
        if (user) return res.status(409).json({ success: false, message: '! 이미 사용 중인 아이디입니다' });
        break;
      case 'nickname':
        user = await UserDAO.findByName(user_name);
        if (user?.i > 0) return res.status(409).json({ success: false, message: '! 이미 사용 중인 닉네임입니다' });
        break;
      case 'email':
        user = await UserDAO.findByEmail(user_email);
        if (user) return res.status(409).json({ success: false, message: '! 이미 사용 중인 이메일입니다' });
        break;
      default:
        return res.status(400).json({ success: false, message: '잘못된 요청 유형입니다.' });
    }
    return res.json({ success: true, message: '사용 가능' });
  } catch (err) {
    console.error('💥 서버 오류:', err);
    res.status(500).json({ error: '로그인 중 서버 오류 발생' });
  }
});

/* ------------------로그인------------------ */
router.post('/login', async (req, res) => {
  const { user_id, user_pw } = req.body;
  console.log('📥 로그인 요청 도착:', req.body);

  try {
    const user = await UserDAO.findById(user_id);
    if (!user) return res.status(401).json({ success: false, message: '존재하지 않는 사용자입니다.' });

    const isMatch = await bcrypt.compare(user_pw, user.user_pw);
    if (!isMatch) return res.status(401).json({ success: false, message: '! 비밀번호가 일치하지 않습니다' });

    const token = issueToken(user);
    res.json({ success: true, token });
  } catch (err) {
    console.error('💥 서버 오류:', err);
    res.status(500).json({ error: '로그인 중 서버 오류 발생' });
  }
});

/* ------------------아이디 존재 확인------------------ */
router.post('/check-id', async (req, res) => {
  const { user_id } = req.body;
  try {
    const user = await UserDAO.findById(user_id);
    return res.json({ exists: !!user });
  } catch (err) {
    console.error('❌ 아이디 확인 중 에러:', err);
    return res.status(500).json({ exists: false });
  }
});

/* ------------------소셜 로그인------------------ */
// 카카오 
const KAKAO_CLIENT_ID = 'f6372d1dc197e39ed6c42d524e310b68';
const KAKAO_REDIRECT_URI = 'http://localhost:5173/auth/kakao';

// 📞 소셜 로그인 요청 (프론트에서 온 연락) ----- //
router.get('/kakao/login', (req, res) => {
  const redirectUri = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
  res.redirect(redirectUri);
  // 프론트에서 클라이언트가 정보 제공 동의하면 SocialAuthHandler.jsx에서 처리
  // <Route path="/auth/kakao" element={<SocialAuthHandler />} />
  // <Route path="/auth/naver" element={<SocialAuthHandler />} />
});

// 📞 api 제공업체가 돌려주는 응답을  ---------- //
// SocialAuthHandler.jsx가 받아서 해독하고(미들웨어)
//     각각의 경우의 수(provider)에 따라 처리 --- //
router.post('/:provider', async (req, res) => {
  const { provider } = req.params;
  const { code } = req.body;

  // ☠️ 응답을 제대로 받지 못함  --------------- //
  if (!code) return res.status(400).send('인가 코드 없음');

  switch (provider) {
    case 'kakao':
      // 카카오 로그인 로직
      try {
        // 1. 인가 코드로 access_token 요청
        const tokenRes = await axios.post(
          `https://kauth.kakao.com/oauth/token`,
          new URLSearchParams({
            grant_type: 'authorization_code',
            client_id: KAKAO_CLIENT_ID,
            redirect_uri: KAKAO_REDIRECT_URI,
            code,
          }).toString(),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        const { access_token } = tokenRes.data;

        // 2. access_token으로 사용자 정보 요청
        const userRes = await axios.get(`https://kapi.kakao.com/v2/user/me`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });

        const kakaoAccount = userRes.data.kakao_account;
        const user_id = 'kakao_' + userRes.data.id;
        const email = kakaoAccount.email;
        const social_id = userRes.data.id;

        // 3. 여기서 DB에 사용자 정보 확인/등록
        const user = await UserDAO.registerUser(user_id, email, social_id);

        // 카카오 로그인 후 JWT 발급
        const token = issueToken(user);

        res.status(200).json({ token });
      } catch (err) {
        console.error(err);
        res.status(500).send('카카오 로그인 실패');
      }
      break;

    case 'naver':
    // 네이버 로그인 로직
    break;

    default:
      return res.status(400).send('지원하지 않는 소셜 로그인입니다.');
  }
});

/* ------------------인증 확인------------------ */
router.get('/check-auth', authMiddleware, (req, res) => {
  res.json({ message: `안녕하세요, ${req.user.user_id}님!` });
});

export default router;