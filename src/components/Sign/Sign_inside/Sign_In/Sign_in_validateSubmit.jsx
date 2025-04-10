// 아이디 , 비밀번호 유효성 검사
export const validateId = (id) => {
  if (!id) return '아이디를 입력해주세요';
  if (id.length < 6 || id.length >= 20) return '6자 이상 20자 미만으로 입력해주세요';
  return '';
};

export const validatePassword = (pw) => {
  if (!pw) return '비밀번호를 입력해주세요';
  const pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  if (!pwRegex.test(pw)) {
    return '영문, 숫자, 특수문자를 포함해 8자 이상 입력해주세요';
  }
  return '';
};
