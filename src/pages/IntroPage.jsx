import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/IntroPage.css';

// 이미지 import
import sherlockLogo from '../assets/images/IntroPage_img/Intro_sher.png';
import lockImage from '../assets/images/IntroPage_img/lock/lock.png';
import lockGif from '../assets/images/IntroPage_img/lock/lock.gif';
import background from '../assets/images/default_background.png';

function IntroPage() {
  // 상태 변수 초기화
  const [imageSrc, setImageSrc] = useState(lockImage); // 자물쇠 이미지의 초기 상태 설정
  const [shelOpacity, setShelOpacity] = useState(1); // Sherlock 로고의 초기 opacity 설정
  const [lockPosition, setLockPosition] = useState({ left: '195px', top: '10px' }); // 자물쇠의 위치 초기값
  const [clicked, setClicked] = useState(false); // 자물쇠 클릭 여부 상태
  const navigate = useNavigate(); // 페이지 전환을 위한 navigate 함수
  const [showDescription, setShowDescription] = useState(false); // 사이트 설명의 표시 여부
  const [showHint, setShowHint] = useState(false); // 힌트 표시 여부

  const lockRef = useRef(null); // 자물쇠 이미지에 대한 ref
  const [canClick, setCanClick] = useState(false); // 자물쇠 클릭 가능 여부

  // 자물쇠 클릭 시 발생할 동작
  const handleClick = () => {
    if (clicked || !canClick) return; // 애니메이션 전에는 클릭 금지
  
    setClicked(true);
    setShelOpacity(0);
    setShowDescription(false);
  
    setTimeout(() => {
      setImageSrc(lockGif);
      setLockPosition({ left: '55%', top: '45%' });
  
      lockRef.current.style.transition = 'all 1s ease-in-out';
      lockRef.current.style.transform = 'translate(-50%, -50%)';
    });
  
    setTimeout(() => {
      navigate('/Main');
    }, 2300);
  };

  // 컴포넌트 마운트 후 2초 뒤에 site-description을 표시
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDescription(true); // 사이트 설명을 보이게 설정
    }, 2000); // 2000ms = 2초 후에 사이트 설명 표시

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer);
  }, []); // 이 effect는 컴포넌트가 마운트 될 때만 실행됨

  // 컴포넌트 마운트 후 10초 뒤에 hint을 표시
  useEffect(() => {
    const timer2 = setTimeout(() => {
      setShowHint(true); // 힌트를 보이게 설정
    }, 10000); // 10000ms = 10초 후에 힌트트 표시

    // 컴포넌트 언마운트 시 타이머 정리
    return () => clearTimeout(timer2);
  }, []); // 이 effect는 컴포넌트가 마운트 될 때만 실행됨

  useEffect(() => {
    const desc = document.querySelector('.site_description');
    const handleAnimationEnd = () => {
      setCanClick(true); // 애니메이션이 끝나면 클릭 가능
    };
  
    if (desc) {
      desc.addEventListener('transitionend', handleAnimationEnd);
    }
  
    return () => {
      if (desc) {
        desc.removeEventListener('transitionend', handleAnimationEnd);
      }
    };
  }, []);

  return (
    <div className='IntroPage_wrap'>
      <img
        id='Intro_background'
        src={background}
        alt='Intro_background'
      />

      <div className={`hint ${showHint ? "show2" : ""}`}>
        <p>! 자물쇠 클릭 !</p>
      </div>

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
        <div className={`site_description ${showDescription ? 'show' : ''}`}>
          <p>방탈출 창작 & 공유 플랫폼</p>
        </div>
      </div>
    </div>
  );
}

export default IntroPage;