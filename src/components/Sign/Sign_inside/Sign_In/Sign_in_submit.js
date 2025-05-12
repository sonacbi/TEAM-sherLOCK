// Sign_in_submit.js 
export async function submitLogin(user_id, user_pw, setUserPwError, setIsLoading) {
  try {
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: user_id,
        user_pw: user_pw,
      }),
    });

    const data = await response.json();

    if (response.ok && data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('lastLoginMethod', data.loginMethod);

      // 로딩 애니메이션을 충분히 보여주기 위한 딜레이
      setIsLoading(true);

      setTimeout(( )=> {
        // alert('로그인 성공!');
        
        window.location.reload(); // 이건 현재 경로를 유지한 채 새로고침
      }, 3000);

    } else {
      // ❗ 비밀번호 에러 메시지 전달
      if (data.message === '! 비밀번호가 일치하지 않습니다') {
        setUserPwError('! 비밀번호가 일치하지 않습니다');}
    }
  } catch (err) {
    console.error('로그인 에러:', err);
    alert('서버 오류 발생');
  }
}