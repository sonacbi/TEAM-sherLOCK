// 카카오, 네이버 api 로그인 처리용 페이지 (추가)
// 어디서 들어온 응답인지(path) 확인하고 유형에 맞게 처리
import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

function SocialAuthHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const called = useRef(false); // ✅ 중복 방지용 플래그

  useEffect(() => {
    // URL에서 code 값 추출
    if (called.current) return; // ❌ 이미 호출했으면 더 이상 실행하지 않음
    called.current = true;      // ✅ 첫 실행이면 true로 바꿈

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

        // 소셜 로그인 호출 전에 저장했던 주소로 리턴 
        const prevPath = localStorage.getItem('prevPath') || '/';
        navigate(prevPath);

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
