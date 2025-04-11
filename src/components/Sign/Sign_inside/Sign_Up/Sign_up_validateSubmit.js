// Sign_in_validateSubmit.js
// 유효성 검사 시행 후 폼 제출 액션 시행 (Sign_up_submit)
import signSubmit from './Sign_up_submit.js'; // → Sign_up_submit.jsx (프론트폼 제출)

/* ------------------------------- 프론트 유효성 검사 -------------------------------*/
// 아이디 유효성 검사
  /* (1) 포커싱했는데 아이디 입력칸이 비워짐 */
  /* (2) 6자 이상 20자 미만으로 입력 */
  export const validateId = async (id) => {
    if (!id) return '! 아이디를 입력해주세요';
    if (id.length < 6 || id.length >= 20) return '! 6자 이상 20자 미만으로 입력해주세요';
    
    const { success, message } = await checkDuplicated(id, 'userId');
    if (!success) return message;
    
    return '';
  };
  /* (3) DB에 이미 입력된 id일 때 '이미 사용 중인 아이디입니다' (백↓)  */ 

  // 비밀번호 유효성 검사
    /* (1) 포커싱했는데 비밀번호 입력칸이 비워짐 */
    /* (2) 영문, 숫자, 특수문자를 포함해 8자 이상 입력 */
    export const validatePassword = (pw) => {
      if (!pw) return '! 비밀번호를 입력해주세요';
      const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
      if (!pwRegex.test(pw)) {
        return '! 영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요';
      }
      return '';
    };

  // 비밀번호check 유효성 검사
    export const validatePasswordCheck = (pw, pwCheck) => {
      if (!pwCheck) return '! 비밀번호 확인을 입력해주세요';
      if (pw !== pwCheck) return '! 비밀번호가 일치하지 않습니다';
      return '';
    };
  
  // 닉네임 유효성 검사 
  const forbiddenWords = ['admin', '운영자', '관리자'];
    /* 부적절한 단어가 들어갈 경우 거르는 유효성 검사. 필터용 단어는 별도 []로 정리 */
    export const validateNickname = async (nickname) => {
      if (!nickname) return '! 닉네임을 입력해주세요';
      if (nickname.length < 2 || nickname.length >= 12) return '! 2자 이상 12자 미만으로 입력해주세요';
      if (forbiddenWords.some(word => nickname.includes(word))) {
        return '! 부적절한 단어가 포함되어 있습니다';
      }

      const { success, message } = await checkDuplicated(nickname, 'nickname');
      if (!success) return message;

      return '';
    };
    /* (백↓) */

    // 이메일 유효성 검사 (unique key 세팅)
    export const validateEmail = async (email, domain) => {
      if (!email) return '! 이메일을 입력해주세요';
      if (!domain) return '! 도메인을 선택해주세요';

      const fullEmail = email + '@' + domain
      const { success, message } = await checkDuplicated(fullEmail, 'email');
      if (!success) return message;

      return '';
    };    

    // 생일 유효성 검사 (오늘 이후 날짜 입력할 수 없음)
    export const validateBirth = ({ year, month, day }) => {
      const selected = new Date(`${year}-${month}-${day}`);
      const today = new Date();
    
      if (selected > today) return '! 미래 날짜는 선택할 수 없습니다';
      return '';
    };

/* ------------------------------- 폼 제출용 핸들이벤트 -------------------------------*/

const handleSubmit = async (e, formData, setErrors, onSuccess, onFailure) => {
    e.preventDefault();

    const { userId, password, passwordCheck, nickname, email, domain, birth } = formData;


    const errors = {
      userId: validateId(userId),
      password: validatePassword(password),
      passwordCheck: validatePasswordCheck(password, passwordCheck),
      nickname: validateNickname(nickname),
      email: validateEmail(email, domain),
      birth: validateBirth(birth)
    };

    setErrors(errors); // 각 입력 필드에 에러 메시지 출력되도록




    // 하나라도 에러가 있으면 중단
    const hasError = Object.values(errors).some(err => err !== '');
    if (hasError) return;

    // 아이디 유효성 검사
      /* (3) DB에 이미 입력된 id일 때 '이미 사용 중인 아이디입니다' */
      // (백엔드 통신-검증용 코드를 하단에 별도로 작성)

    // 비밀번호 유효성 검사 (프론트↑)

    // 비밀번호check 유효성 검사 (프론트↑)

    // 닉네임 유효성 검사 (중복가능인지, 불가능인지에 따라 코드가 달라짐.)
      /* - 중복가능일 경우 닉네임 뒤에 자동으로 #001, #002, #003... 숫자가 붙으며 유저가 사용한 닉네임의 고유성을 보장함. 처음 그 닉네임을 선점한 사람에겐 붙지 않음 */
      // (백엔드 통신-검증용 코드를 하단에 별도로 작성)
      /* - 중복불가능일 경우 '이미 사용된 닉네임입니다' 출력 */
      // (백엔드 통신-검증용 코드를 하단에 별도로 작성)

    // 이메일 유효성 검사 (unique key 세팅)
      /* 이미 사용한 이메일의 경우 '이미 사용되고 있는 이메일입니다' 출력 */
      // (백엔드 통신-검증용 코드를 하단에 별도로 작성)

    // 생일 유효성 검사 (오늘 이후 날짜 입력할 수 없음) (프론트↑)

    

    const result = await signSubmit({ userId, password, nickname, email, domain, birth });

    if (result.success) {
        alert('회원가입 성공!');
        onSuccess(); // → Sign_up.jsx의 onSignInClick 실행
    } else {
        alert(result.message || '회원가입 실패!');
        if (onFailure) onFailure(result);
    }
};


const checkDuplicated = async (value, type) => {
  let user = {}

  switch (type) {
    case 'userId' :
      user.user_id = value;
      break;
    case 'nickname' :
      user.user_name = value;
      break;
    case 'email' :
      user.user_email = value;
      break;
    default :
      console.log("! 타입 미지정! ");
  }

  user.duple_type = type;

  try {
    const res = await fetch('http://localhost:5000/auth/duplicated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    const result = await res.json(); // 이 안에서만 써야 함

    if (res.ok) {
      return { success: true };
    } else {
      return { success: false, message: result.message || '중복 오류' };
    }
  } catch (error) {
    // 네트워크 오류나 서버 자체가 응답 안했을 경우
    console.error("❗에러 내용:", error);
    return { success: false, message: '서버 연결 오류', error: error.message };
  }
};
  

export default handleSubmit;
