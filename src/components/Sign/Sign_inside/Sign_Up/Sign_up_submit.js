// 회원가입 관련 (front)
const signSubmit = async ({ userId, password, nickname, email, domain, birth }) => {
  const birthDate = 
  birth?.year && birth?.month && birth?.day
    ? `${birth.year}-${birth.month}-${birth.day}`
    : null;
  const fullEmail = `${email}@${domain}`;

  const user = {
    user_id: userId,
    user_pw: password,
    user_name: nickname,
    user_email: fullEmail,
    user_type: 1,
    membership: 'inactive',
    birth_date: birthDate
  };

  try {
    const res = await fetch('http://localhost:5000/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });

    if (res.ok) {
      return { success: true };
    } else {
      const err = await res.json();
      return { success: false, message: err.error };
    }
  } catch (error) {
    return { success: false, message: '서버 연결 오류' };
  }
};

export default signSubmit;
