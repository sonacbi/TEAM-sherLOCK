// Sign_in_submit.jsx
export async function submitLogin(user_id, user_pw) {
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
      alert('로그인 성공!');
      window.location.href = '/Main';
    } else {
      
    }
  } catch (err) {
    console.error('로그인 에러:', err);
    alert('서버 오류 발생');
  }
}
