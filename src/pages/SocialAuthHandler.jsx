// 카카오, 네이버 api 로그인 처리용 페이지 (추가)

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function SocialAuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // URL에서 code 값 추출
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    console.log("➡️ URL에 들어있는 code:", code);  // ✅ 콘솔 추가

    // 어떤 소셜 로그인인지 path에서 판별
    const path = location.pathname;
    let provider = '';
    if (path.includes('/kakao')) provider = 'kakao';
    if (path.includes('/naver')) provider = 'naver';

    if (!code || !provider) {
      alert('소셜 로그인에 실패했습니다.');
      navigate('/Main');
      return;
    }

    // 백엔드에 소셜 로그인 요청 보내기
    const fetchData = async () => {
      try {
        const res = await axios.post(`http://localhost:5000/auth/${provider}`, { code }
          , {
            headers: {
              'Content-Type': 'application/json',  // 필요하면 Authorization 추가
              'Authorization': 'Bearer your_token',  // 로그인 시 토큰이 있다면 추가
            }
          }
        );
        console.log(`/auth/${provider}/login?code=${code}`);
        // 로그인 성공 시 로컬스토리지에 토큰 저장 (예시)
        localStorage.setItem('token', res.data.token);
        navigate('/Main'); // 메인 페이지로 이동
      } catch (err) {
        console.error(err);
        alert('소셜 로그인 처리 중 오류가 발생했습니다.');
        navigate('/Main');
      }
    };

    fetchData();
  }, [location, navigate]);

  return (
    <div>
      <p>로그인 처리 중입니다...</p>
    </div>
  );
}

export default SocialAuthHandler;
