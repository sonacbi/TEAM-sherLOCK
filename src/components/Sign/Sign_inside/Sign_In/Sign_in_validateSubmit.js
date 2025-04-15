// ./Sign_in_validateSubmit.js
// 아이디 , 비밀번호 유효성 검사
import axios from 'axios';


export const validateId = (id) => {
  if (!id) return '! 아이디를 입력해주세요';
  if (id.length < 6 || id.length >= 20) return '! 6자 이상 20자 미만으로 입력해주세요';
  return '';
};

export const validatePassword = (pw) => {
  console.log("pw"+pw);
  if (!pw) return '! 비밀번호를 입력해주세요';
const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  if (!pwRegex.test(pw)) {
  return '! 영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요';
  }   
  return '';
};

  export const checkLoginUserId = async (id, setUserIdError) => {
 
    try {
      const res = await axios.post('http://localhost:5000/auth/check-id', { user_id: id });
      const { exists } = res.data;
  
      if (!exists) {
        setUserIdError('! 아이디가 존재하지 않습니다');
      } else {
        setUserIdError('');
      }
    } catch (err) {
      console.error('❌ 로그인 아이디 검사 에러:', err);
      setUserIdError('서버 오류가 발생했습니다.');
    }
  };