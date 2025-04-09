import { useEffect, useRef, useState } from "react";
/* -------------------------- (추가) ------------------------------ */
// 클라이언트가 jwt가 유효한 정보인지 해독하기 위한 라이브러리
import { jwtDecode } from "jwt-decode";
/* --------------------------------------------------------------- */


import Header_Logo from '../components/Header_Logo/Header_Logo';
import Sign from '../components/Sign/Sign_outside/Sign_outside';
import Sign_in from '../components/Sign/Sign_inside/Sign_In/Sign_in';
import Sign_up from '../components/Sign/Sign_inside/Sign_Up/Sign_up';
import Footer from '../components/Footer/Footer';
import '../styles/MainPage.css';

import background from '../assets/images/default_background.png';
import notice from '../assets/images/MainPage_img/notice.png';
import horror_outline from '../assets/images/MainPage_img/horror_outline.png';
import horror_icon from '../assets/images/MainPage_img/horror_icon.png';
import adventure_outline from '../assets/images/MainPage_img/adventure_outline.png';
import adventure_icon from '../assets/images/MainPage_img/adventure_icon.png';
import crime_outline from '../assets/images/MainPage_img/crime_outline.png';
import crime_icon from '../assets/images/MainPage_img/crime_icon.png';

const themes = [
  { id: "horror", label: "호러", outline: horror_outline, icon: horror_icon },
  { id: "adventure", label: "모험", outline: adventure_outline, icon: adventure_icon },
  { id: "crime", label: "범죄", outline: crime_outline, icon: crime_icon }
];

function MainPage() {
  const articlesRef = useRef([]);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  /* -------------------------- (추가) ------------------------------ */
  // 로그인 성공한 유저가 메인페이지로 들어왔을 때 '인증된 사용자'임을 확인하고 필요한 데이터를 불러옴
  const [userNickname, setUserNickname] = useState(null); 
  /* --------------------------------------------------------------- */

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleCloseSignIn = () => {
    setShowSignIn(false);
  };

  const handleSignUpClick = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };
  
  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

  useEffect(() => {
    if (showSignIn || showSignUp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showSignIn, showSignUp]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("show");
            }, index * 200);
          }
        });
      },
      { threshold: 0.3 }
    );

    articlesRef.current.forEach((article) => {
      if (article) observer.observe(article);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleWheel = (e) => {
      if (showSignIn || showSignUp) {
        e.preventDefault();
        return;
      }
  
      e.preventDefault();
  
      if (e.deltaY > 0) {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth',
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      }
    };
  
    window.addEventListener('wheel', handleWheel, { passive: false });
  
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [showSignIn, showSignUp]);

  /* -------------------------- (추가) ------------------------------ */
  // 로그인 여부 확인용 (디버깅 로그)
  useEffect(() => {
    const token = localStorage.getItem("token");
  
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🧾 디코딩된 결과:", decoded);
        console.log(JSON.stringify(decoded, null, 2));
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
  // 로그아웃 임시 구현
  const handleLogout = () => {
    // localStorage에서 토큰 삭제
    localStorage.removeItem('token');
  
    // 사용자 닉네임 초기화
    setUserNickname(null);
  
    // 로그아웃 후 리디렉션 (예: 홈 페이지로 이동)
    window.location.href = '/Main';
  };
  
  
  /* --------------------------------------------------------------- */

  return (
    <div className='MainPage_wrap'>
      <div className='MainPage_content'>
        <img id='Main_background' src={background} alt='Main_background' />

        <header>
          <img id='notice' src={notice} alt='notice' />
          <Header_Logo />
          {/* -------------------------- (추가) ------------------------------ */
          // 유효한 토큰을 갖고있는 사용자에게만 보이는 화면 (임시 - 편하게 수정하세요)
          }
          {userNickname ? (
            <p>환영합니다! {userNickname}님! &nbsp;
            <a href="/mypage">마이페이지</a>
            {/* 로그아웃 버튼 */}
            <button onClick={handleLogout}>로그아웃</button>
            </p>
          ) : (
            <Sign onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick}/>
          )}
          {/* --------------------------------------------------------------- */}
        </header>

        <div className="theme">
          {themes.map(({ id, label, outline, icon }, index) => (
            <article
              key={id}
              id={id}
              ref={(el) => {
                if (el) articlesRef.current[index] = el;
              }}
            >
              <img className={`${id}_outline`} src={outline} alt={`${id}_outline`} />
              <div className={`${id}_icon`}>
                <img className="theme_icon" src={icon} alt={`${id}_icon`} />
                <p>{label}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
      {showSignIn && <Sign_in onClose={handleCloseSignIn} onSignUpClick={handleSignUpClick}/>}
      {showSignUp && <Sign_up onClose={handleCloseSignUp} onSignInClick={handleSignInClick}/>}
    </div>
  );
}

export default MainPage;