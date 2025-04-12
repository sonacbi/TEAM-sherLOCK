// ./Social_submit.js

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const KakaoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const code = new URL(window.location.href).searchParams.get("code");

    const sendCodeToBackend = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/auth/kakao/login?code=${code}`);
        // 토큰이나 사용자 정보를 localStorage 등에 저장
        console.log('로그인 성공', res.data);
        navigate('/Main'); // 홈으로 이동
      } catch (err) {
        console.error(err);
        alert('로그인 실패');
      }
    };

    if (code) sendCodeToBackend();
  }, []);

  return <div>로그인 중입니다...</div>;
};

export default KakaoCallback;
