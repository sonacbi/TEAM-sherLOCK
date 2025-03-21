import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/IntroPage.css';

// 이미지 import
import sherlockLogo from '../assets/images/logo/Sherlocklogo_bi.png';
import lockImage from '../assets/images/lock/자물쇠.png';
import lockGif from '../assets/images/lock/자물쇠.gif';

function IntroPage() {
  // 상태 변수 초기화
  const [imageSrc, setImageSrc] = useState(lockImage); // 자물쇠 이미지의 초기 상태 설정
  const [shelOpacity, setShelOpacity] = useState(1); // Sherlock 로고의 초기 opacity 설정
  const [lockPosition, setLockPosition] = useState({ left: '195px', top: '10px' }); // 자물쇠의 위치 초기값
  const [clicked, setClicked] = useState(false); // 자물쇠 클릭 여부 상태
  const navigate = useNavigate(); // 페이지 전환을 위한 navigate 함수
  const [showDescription, setShowDescription] = useState(false); // 사이트 설명의 표시 여부

  const lockRef = useRef(null); // 자물쇠 이미지에 대한 ref

  // 자물쇠 클릭 시 발생할 동작
  const handleClick = () => {
    // 자물쇠가 이미 클릭되었으면 아무 작업도 하지 않음
    if (clicked) return;

    setClicked(true); // 클릭 상태 변경

    // Sherlock 로고의 opacity를 0으로 설정하여 천천히 사라지게 함
    setShelOpacity(0);

    // site-description을 숨김
    setShowDescription(false);

    // 일정 시간 후에 자물쇠 이미지를 GIF로 변경하고, 위치를 중앙으로 이동
    setTimeout(() => {
      setImageSrc(lockGif); // 자물쇠 이미지를 애니메이션 GIF로 변경

      setLockPosition({
        left: '55%', // 자물쇠를 화면 중앙으로 이동
        top: '45%',
      });

      // 자물쇠 이동을 부드럽게 처리
      lockRef.current.style.transition = 'all 1s ease-in-out'; // 부드럽게 이동
      lockRef.current.style.transform = 'translate(-50%, -50%)'; // 중앙으로 정확히 이동
    });

    // 2.3초 후에 Main 페이지로 이동
    setTimeout(() => {
      navigate('/Main'); // /Main으로 이동
    }, 2300); // 2300ms = 2.3초 후 이동
  };

  // 컴포넌트 마운트 후 2초 뒤에 site-description을 표시
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDescription(true); // 사이트 설명을 보이게 설정
    }, 2000); // 2000ms = 2초 후에 사이트 설명 표시

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, []); // 이 effect는 컴포넌트가 마운트 될 때만 실행됨

  return (
    <div className='IntroPage-wrap'>
      <div className='intro'>
        {/* Sherlock 로고: opacity 변화로 천천히 사라짐 */}
        <img 
          id='shel' 
          src={sherlockLogo} 
          alt="Sherlock Logo" 
          style={{ opacity: shelOpacity, transition: 'opacity 1s ease' }} // 부드럽게 사라지도록 설정
        />
        
        {/* 자물쇠 이미지: 클릭 시 애니메이션 및 이동 */}
        <img 
          id='lock' 
          src={imageSrc} 
          alt="Lock" 
          ref={lockRef} 
          onClick={handleClick} // 자물쇠 클릭 시 handleClick 함수 실행
          style={{ 
            left: lockPosition.left, 
            top: lockPosition.top,
          }} 
        />

        {/* site-description: 초기에는 보이지 않다가 일정 시간 후에 표시됨 */}
        <div className={`site-description ${showDescription ? 'show' : ''}`}>
          <p>방탈출 창작 & 공유 플랫폼</p>
        </div>
      </div>
    </div>
  );
}

export default IntroPage;