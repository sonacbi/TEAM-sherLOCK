import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import UserDAO from './modules/DAO/userDAO.js'
// import userRoutes from './modules/routes/userRoutes.js';
import dotenv from 'dotenv';
dotenv.config({ path: './modules/db/.env' });
import bcrypt from 'bcrypt'; // 추가
import jwt from 'jsonwebtoken';
import authMiddleware from './modules/middlewares/authMiddleware.js';

const app = express();
app.use(express.json());

app.use(cors()); // 모든 포트에서 요청을 받음
app.use(bodyParser.json()); // post 해석

/* ------------------회원가입 정보를 서버에서 받는 코드------------------ */
app.post('/auth/signup', async (req, res) => {
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
      deleted: 0
    };

    await UserDAO.insertUser(user);
    res.status(201).json({ meesage : '회원가입 성공!'});

  } catch(err) {
    console.error(err);
    res.status(500).json({ error : '회원가입 중 오류 발생'});
  }

});
/* ------------------------- 회원가입 유효성 검사 ------------------------- */
app.post('/auth/duplicated', async (req, res) => {
  const { user_id, user_name, user_email, duple_type } = req.body;
  let user = '';
  try{
    switch(duple_type) {
      case 'userId' :
        user = await UserDAO.findById(user_id);
        if (user) return res.status(409).json({ success: false, message: '! 이미 사용 중인 아이디입니다' });
        break;
      case 'nickname' :
        user = await UserDAO.findByName(user_name);
        if (user?.i > 0) return res.status(409).json({ success: false, message: '! 이미 사용 중인 닉네임입니다\n 이대로 진행할 시 고유번호가 붙습니다.' });
        // 위는 디버깅용 코드. (유저가 위의 경고문을 보고도 진행한다면 변경함)
        break;
      case 'email' :
        user = await UserDAO.findByEmail(user_email);
        if (user) return res.status(409).json({ success: false, message: '! 이미 사용 중인 이메일입니다' });
        break;
      default:
        return res.status(400).json({ success: false, message: '잘못된 요청 유형입니다.' });
    }
    return res.json({ success: true, message: '사용 가능' });
  }catch (err) {
    console.error('💥 서버 오류:', err);
    res.status(500).json({ error: '로그인 중 서버 오류 발생' });
  }
});

/* --------------------------- 로그인 토큰 발급 --------------------------- */
// 로그인 API
app.post('/auth/login', async (req, res) => {
  const { user_id, user_pw } = req.body;
  console.log('📥 로그인 요청 도착:', req.body);

  try {
    const user = await UserDAO.findById(user_id);
    console.log('🔍 사용자 조회 결과:', user);

    if (!user) {
      console.log('❌ 사용자 없음');
      return res.status(401).json({ success: false, message: '존재하지 않는 사용자입니다.' });
    }

    const isMatch = await bcrypt.compare(user_pw, user.user_pw);
    console.log('🔐 비밀번호 비교 결과:', isMatch);

    if (!isMatch) {
      console.log('❌ 비밀번호 불일치');
      return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }
    console.log('🧪 user 객체 전체 확인:', user); // <- 여기에 user_name 있는지 다시 확인
    console.log('🧪 JWT에 넣을 user_id:', user.user_id);
    console.log('🧪 JWT에 넣을 user_name:', user.user_name); // 여기서 undefined면 문제임

    const token = jwt.sign(
      {
        user_id: user.user_id,
        user_name: user.user_name  // 이게 undefined면 프론트에서 안 뜸!
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );


    console.log('✅ 로그인 성공, 토큰 발급:', token);
    return res.json({ success: true, token });

  } catch (err) {
    console.error('💥 서버 오류:', err);
    res.status(500).json({ error: '로그인 중 서버 오류 발생' });
  }
});

// 아이디 존재 확인 API (로그인용)
app.post('/auth/check-id', async (req, res) => {
  const { user_id } = req.body;

  try {
    const user = await UserDAO.findById(user_id);
    if (user) {
      return res.json({ exists: true });
    } else {
      return res.json({ exists: false });
    }
  } catch (err) {
    console.error('❌ 아이디 확인 중 에러:', err);
    return res.status(500).json({ exists: false });
  }
});



/* --------------------------- 로그인 인증 절차 --------------------------- */
app.get('/Main', authMiddleware, (req, res) => {
  res.json({ message: `안녕하세요, ${req.user.user_id}님!` });
});
/* ---------------------------------------------------------------------- */

// 라우트 연결
/* app.use('/user', userRoutes); */





// 서버 실행
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`User server : http://localhost:${PORT}`);
});
