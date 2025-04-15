import { useEffect, useRef, useState } from "react";

import Header_Logo from '../components/Header_Logo/Header_Logo';
import Profile from '../components/Profile/Profile';
import Sign_in from '../components/Sign/Sign_inside/Sign_In/Sign_in';
import Sign_up from '../components/Sign/Sign_inside/Sign_Up/Sign_up';
import Footer from '../components/Footer/Footer';
import '../styles/MainPage.css';

import background from '../assets/images/default_background.png';
import notice_img from '../assets/images/MainPage_img/notice.png';
import notice_speech_bubble from '../assets/images/MainPage_img/notice_speech_bubble1.png';
import horror_outline from '../assets/images/MainPage_img/horror_outline.png';
import horror_icon from '../assets/images/MainPage_img/horror_icon.png';
import adventure_outline from '../assets/images/MainPage_img/adventure_outline.png';
import adventure_icon from '../assets/images/MainPage_img/adventure_icon.png';
import crime_outline from '../assets/images/MainPage_img/crime_outline.png';
import crime_icon from '../assets/images/MainPage_img/crime_icon.png';

function MainPage() {
  const articlesRef = useRef([]);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loader = useRef(null);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const noticeRef = useRef(null);
  const [showNotice, setShowNotice] = useState(false);

  const themes = [
    { id: "horror", label: "호러", outline: horror_outline, icon: horror_icon },
    { id: "adventure", label: "모험", outline: adventure_outline, icon: adventure_icon },
    { id: "crime", label: "범죄", outline: crime_outline, icon: crime_icon }
  ];

  const exampleNotices = [
    '서버 점검 안내',
    '신규 기능 업데이트',
    '이벤트 공지사항',
    '시스템 긴급 점검',
    '이용 약관 변경 안내',
    '개인정보 처리방침 변경',
    '신년 이벤트 진행 중',
    '설문조사 참여 이벤트',
    '로그인 오류 수정 완료',
    '서비스 개선사항 안내'
  ];

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
    
      const noticeTable = document.querySelector('.notice_table');
      const noticeText = document.querySelector('.notice_text');
      if (
        (noticeTable && noticeTable.contains(e.target)) ||
        (noticeText && noticeText.contains(e.target))
      ) {
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
        });.1  
      }
    };
  
    window.addEventListener('wheel', handleWheel, { passive: false });
  
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [showSignIn, showSignUp]);

  useEffect(() => {
    const loadMore = async () => {
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const newItems = exampleNotices.slice(startIndex, endIndex);
  
      setItems((prev) => [...prev, ...newItems]);
  
      if (endIndex >= exampleNotices.length) {
        setHasMore(false);
      }
    };
  
    if (page !== 1 && hasMore) {
      loadMore();
    }
  }, [page]);
  
  useEffect(() => {
    const initialItems = exampleNotices.slice(0, 10);
    setItems(initialItems);
  }, []);
  
  useEffect(() => {
    if (!loader.current || !isNoticeOpen) return;
  
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore) {
        setPage((prevPage) => prevPage + 1);
      }
    }, { 
      threshold: 0, 
      rootMargin: '0px 0px 200px 0px'
    });
  
    observer.observe(loader.current);
  
    return () => {
      observer.disconnect();
    };
  }, [hasMore, isNoticeOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        noticeRef.current &&
        !noticeRef.current.contains(event.target) &&
        event.target.id !== 'notice_img'
      ) {
        setIsNoticeOpen(false);
      }
    };
  
    document.addEventListener('mousedown', handleClickOutside);
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNoticeClick = (e) => {
    e.stopPropagation();
    setIsNoticeOpen((prev) => !prev);
  };

  const handleItemClick = (index) => {
    setShowNotice(true);
  };

  return (
    <div className='MainPage_wrap'>
      <div className='MainPage_content'>
        <img id='Main_background' src={background} alt='Main_background' />

        <header>
          <div className="notice">
            <img id='notice_img' src={notice_img} alt='notice_img' onClick={handleNoticeClick} />

            <div ref={noticeRef} className={`notice_content ${isNoticeOpen ? 'show' : 'hide'}`}>
              <img id="notice_speech_bubble" src={notice_speech_bubble} alt="notice_speech_bubble" />
              {!showNotice && (
                <div className="notice_table">
                  {items.map((item, index) => (
                    <div key={index} className="notice_table_text" onClick={() => handleItemClick(index)}>
                      {item}
                    </div>
                  ))}
                  {hasMore && <div ref={loader} style={{ height: '10px' }} />}
                </div>
              )}

              {showNotice && (
                <div className="notice_text">
                  <div className="title">
                    서버 점검 안내
                  </div>

                  <div className="text">
                    안녕하세요, [셜LOCK] 운영팀입니다.<br/><br/>
                    보다 나은 서비스 제공을 위해 서버 점검이 예정되어 있어 안내드립니다.<br/><br/>
                    * 점검 일시: 2025년 4월 15일(화) 02:00 ~ 06:00 (약 4시간 예정)<br/><br/>
                    * 점검 내용: 서버 안정화 및 성능 개선 작업<br/><br/>
                    * 영향 범위: 점검 시간 동안 [웹사이트/앱] 이용이 일시적으로 제한됩니다.<br/><br/>
                    감사합니다.
                  </div>

                  <div className="exit_day">
                    <p className="exit" onClick={() => setShowNotice(false)}>나가기</p>
                    <p className="day">2025-04-13</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <Header_Logo />
          <Profile onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
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