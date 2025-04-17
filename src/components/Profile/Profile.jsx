import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

import Sign from '../Sign/Sign_outside/Sign_outside';
import './Profile.css';

import ex_user_profile from '../../assets/images/Profile/ex_user_profile.png';
import profile_setup_bubble from '../../assets/images/Profile/profile_setup_bubble.png'

const Profile = ({ onSignInClick, onSignUpClick }) => {
  const [userToken, setUserToken] = useState(null);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🧾 디코딩된 결과:", decoded);
        setUserToken(decoded.user_name);
      } catch (error) {
        console.error("❌ 토큰 디코딩 실패:", error);
        setUserToken(null);
      }
    } else {
      console.warn("⚠️ 토큰 없음: 로그인하지 않았거나 삭제됨");
      setUserToken(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserToken(null);
  };

  const handleProfileClick = () => {
    setShowProfileSetup(true);
    // 3초(3000ms) 뒤에 자동으로 숨기기
    setTimeout(() => {
      setShowProfileSetup(false);
    }, 3000);
  };

  return (
    <>
      {userToken ? (
        <div className='profile'>
          <div className='profile_outside'>
            <img 
              id='ex_user_profile'
              src={ex_user_profile}
              alt='ex_user_profile'
              onClick={handleProfileClick}
            />
          </div>

          <div className={`profile_setup ${showProfileSetup ? 'show' : 'hide'}`}>
            <div className='profile_setup_inside'>
              <img 
                id='profile_setup_bubble'
                src={profile_setup_bubble}
                alt='profile_setup_bubble'
              />

              <div className='logout_mypage'>
                <p className='mypage'>MY페이지</p>
                <p className='logout' onClick={handleLogout}>로그아웃</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Sign onSignInClick={onSignInClick} onSignUpClick={onSignUpClick} />
      )}
    </>
  );
};

export default Profile;