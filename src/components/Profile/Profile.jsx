import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useParams, useLocation } from 'react-router-dom';

import Sign from '../Sign/Sign_outside/Sign_outside';
import './Profile.css';

import ex_user_profile from '../../assets/images/Profile/ex_user_profile.png';
import profile_setup_bubble from '../../assets/images/Profile/profile_setup_bubble.png'

// 프로필 컴포넌트 정의 (로그인 여부에 따라 다른 UI 보여줌)
const Profile = ({ onSignInClick, onSignUpClick }) => {
  const [userToken, setUserToken] = useState(null); // 사용자 토큰 상태
  const [showProfileSetup, setShowProfileSetup] = useState(false); // 프로필 설정 창 표시 여부

  // 현재 접속한 페이지 확인 (추가함)-----------------------------
  const { theme } = useParams();
  const location = useLocation();

  const isThemePage = location.pathname.startsWith('/Theme/') && 
                      ['crime', 'adventure', 'horror'].includes(theme);

  // 컴포넌트가 마운트될 때 localStorage에서 토큰 읽고 디코딩
  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (token) {
      try {
        const decoded = jwtDecode(token); // 토큰 디코딩
        console.log("🧾 디코딩된 결과:", decoded);
        setUserToken(decoded.user_name); // 사용자 이름 설정
      } catch (error) {
        console.error("❌ 토큰 디코딩 실패:", error);
        setUserToken(null);
      }
    } else {
      console.warn("⚠️ 토큰 없음: 로그인하지 않았거나 삭제됨");
      setUserToken(null);
    }
  }, []);

  // 로그아웃 처리 함수
  const handleLogout = () => {
    localStorage.removeItem('token'); // 토큰 삭제
    setUserToken(null); // 상태 초기화
  };

  // 프로필 아이콘 클릭 시 프로필 설정창 표시
  const handleProfileClick = () => {
    setShowProfileSetup(true); // 설정창 보이기
    setTimeout(() => {
      setShowProfileSetup(false); // 3초 후 자동 숨김
    }, 3000);
  };

  return (
    <>
      {userToken ? (
        // 로그인된 경우: 사용자 프로필 보여줌
        <>
         {/* 현재 접속한 페이지 확인해서 버튼 랜더링 (추가함)------------ */}
          {isThemePage ? (
            <button>{theme} 제작하기</button> 
          ) : null}

          <div className='profile'>
            <div className='profile_outside'>
              <img 
                id='ex_user_profile'
                src={ex_user_profile}
                alt='ex_user_profile'
                onClick={handleProfileClick} // 프로필 클릭 시 설정창 열기
              />
            </div>

            {/* 프로필 설정 팝업 (MY페이지, 로그아웃 등) */}
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
        </>
      ) : (
        // 로그인되지 않은 경우: 로그인/회원가입 버튼 표시
        <Sign onSignInClick={onSignInClick} onSignUpClick={onSignUpClick} />
      )}
    </>
  );
};

export default Profile;