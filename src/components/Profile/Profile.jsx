import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import Sign from '../Sign/Sign_outside/Sign_outside';
import './Profile.css';

import ex_user_profile from '../../assets/images/Profile/ex_user_profile.png';

const Profile = ({ onSignInClick, onSignUpClick }) => {
  const [userNickname, setUserNickname] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🧾 디코딩된 결과:", decoded);
        setUserNickname(decoded.user_name);
      } catch (error) {
        console.error("❌ 토큰 디코딩 실패:", error);
        setUserNickname(null);
      }
    } else {
      console.warn("⚠️ 토큰 없음: 로그인하지 않았거나 삭제됨");
      setUserNickname(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserNickname(null);
    window.location.href = '/Main'; // 필요에 따라 다른 경로로 수정 가능
  };

  return (
    <>
      {userNickname ? (
        <div className='profile'>
            <img 
                id='ex_user_profile'
                src={ex_user_profile}
                alt='ex_user_profile'
            />

            <p className='profile_nickname'>{userNickname}</p>

            <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <Sign onSignInClick={onSignInClick} onSignUpClick={onSignUpClick} />
      )}
    </>
  );
};

export default Profile;