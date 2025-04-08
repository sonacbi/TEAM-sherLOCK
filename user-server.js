import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import UserDAO from './modules/DAO/userDAO.js'
// import userRoutes from './modules/routes/userRoutes.js';
import dotenv from 'dotenv';
dotenv.config({ path: './modules/db/.env' });
import bcrypt from 'bcrypt'; // 추가

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

/* ---------------------------------------------------------------------- */

// 라우트 연결
/* app.use('/user', userRoutes); */





// 서버 실행
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`User server : http://localhost:${PORT}`);
});
