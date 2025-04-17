import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';

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
  // DOM 요소들을 참조하기 위한 useRef 설정
  const articlesRef = useRef([]);
  const loader = useRef(null);
  const noticeRef = useRef(null);

  // 상태 관리: 로그인/회원가입 폼, 공지사항, 아이템 리스트 관련
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  const navigate = useNavigate();

  // 테마 카테고리 정보 (호러, 모험, 범죄)
  const themes = [
    { id: "horror", label: "호러", outline: horror_outline, icon: horror_icon },
    { id: "adventure", label: "모험", outline: adventure_outline, icon: adventure_icon },
    { id: "crime", label: "범죄", outline: crime_outline, icon: crime_icon }
  ];

  // 예시 공지사항 리스트
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

  // 로그인 버튼 클릭 시 처리
  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  // 로그인 폼 닫기
  const handleCloseSignIn = () => {
    setShowSignIn(false);
  };

  // 회원가입 버튼 클릭 시 처리
  const handleSignUpClick = () => {
    setShowSignIn(false);
    setShowSignUp(true);
  };

  // 회원가입 폼 닫기
  const handleCloseSignUp = () => {
    setShowSignUp(false);
  };

  // 로그인/회원가입 모달이 열려 있을 때 스크롤 방지
  useEffect(() => {
    if (showSignIn || showSignUp) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showSignIn, showSignUp]);

  // 테마 아이템들이 보일 때 페이드 인 애니메이션 처리
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("show");
            }, index * 200); // 각 요소마다 딜레이 주기
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

  // 마우스 휠 이벤트 제어: 페이지 상하단으로 부드럽게 스크롤 이동
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
        });
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [showSignIn, showSignUp]);

  // 공지사항 아이템 로딩 (무한 스크롤 구현)
  useEffect(() => {
    const loadMore = async () => {
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const newItems = exampleNotices.slice(startIndex, endIndex);

      setItems((prev) => [...prev, ...newItems]);

      if (endIndex >= exampleNotices.length) {
        setHasMore(false); // 더 이상 로딩할 데이터 없음
      }
    };

    if (page !== 1 && hasMore) {
      loadMore();
    }
  }, [page]);

  // 첫 로딩 시 공지사항 10개만 세팅
  useEffect(() => {
    const initialItems = exampleNotices.slice(0, 10);
    setItems(initialItems);
  }, []);

  // 무한 스크롤을 위한 IntersectionObserver 설정
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

  // 공지사항 외부 클릭 시 닫기 처리
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

  // 공지 아이콘 클릭 시 펼치기/접기
  const handleNoticeClick = (e) => {
    e.stopPropagation();
    setIsNoticeOpen((prev) => !prev);
  };

  // 공지 아이템 클릭 시 상세 내용 보여주기
  const handleItemClick = (index) => {
    setShowNotice(true);
  };

  // 전체 렌더링 구조 시작
  return (
    <div className='MainPage_wrap'>
      <div className='MainPage_content'>
        {/* 배경 이미지 */}
        <img id='Main_background' src={background} alt='Main_background' />

        {/* 상단 헤더 (로고, 프로필, 공지사항) */}
        <header className="MainPage_header">
          <div className="notice">
            <img id='notice_img' src={notice_img} alt='notice_img' onClick={handleNoticeClick} />

            <div ref={noticeRef} className={`notice_content ${isNoticeOpen ? 'show' : 'hide'}`}>
              <img id="notice_speech_bubble" src={notice_speech_bubble} alt="notice_speech_bubble" />

              {/* 공지사항 목록 보기 */}
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

              {/* 공지사항 상세 보기 */}
              {showNotice && (
                <div className="notice_text">
                  <div className="title">
                    서버 점검 안내
                  </div>

                  <div className="text">
                    {/* 실제 공지 내용 */}
                  </div>

                  <div className="exit_day">
                    <p className="exit" onClick={() => setShowNotice(false)}>나가기</p>
                    <p className="day">2025-04-13</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 로고 & 프로필 영역 */}
          <Header_Logo />
          <Profile onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
        </header>

        {/* 테마별 섹션들 */}
        <div className="theme">
          {themes.map(({ id, label, outline, icon }, index) => (
            <article
              key={id}
              id={id}
              ref={(el) => {
                if (el) articlesRef.current[index] = el;
              }}
              onClick={(e) => {
                const target = e.currentTarget;

                // 클릭 시 축소 애니메이션
                target.classList.add('article-clicked');

                // 다시 커지는 애니메이션
                setTimeout(() => {
                  target.classList.remove('article-clicked');
                  target.classList.add('article-clicked-back');
                }, 150);

                // 애니메이션 종료 후 페이지 이동
                setTimeout(() => {
                  target.classList.remove('article-clicked-back');
                  navigate(`/Theme/${id}`);
                }, 800);
              }}
              style={{ cursor: 'pointer' }}
            >
              {/* 테마 이미지 및 이름 표시 */}
              <img className={`${id}_outline`} src={outline} alt={`${id}_outline`} />
              <div className={`${id}_icon`}>
                <img className="theme_icon" src={icon} alt={`${id}_icon`} />
                <p>{label}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* 하단 푸터 */}
      <Footer />

      {/* 로그인/회원가입 모달 표시 */}
      {showSignIn && <Sign_in onClose={handleCloseSignIn} onSignUpClick={handleSignUpClick}/>}
      {showSignUp && <Sign_up onClose={handleCloseSignUp} onSignInClick={handleSignInClick}/>}
    </div>
  );
}

export default MainPage;