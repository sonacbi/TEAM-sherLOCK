import { useEffect, useRef, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify'; // 공지사항의 콘텐츠를 안전하게 정리하는 라이브러리 (XSS 공격 방지)

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
  const [noticeDetail, setNoticeDetail] = useState(null);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,  // 24시간 형식
    }).replace(',', '');  // 날짜와 시간이 붙어서 나오므로, 쉼표를 제거
  };

  const navigate = useNavigate();

  // 테마 카테고리 정보 (호러, 모험, 범죄)
  const themes = [
    { id: "horror", label: "호러", outline: horror_outline, icon: horror_icon },
    { id: "adventure", label: "모험", outline: adventure_outline, icon: adventure_icon },
    { id: "crime", label: "범죄", outline: crime_outline, icon: crime_icon }
  ];
  
  // 공지사항 불러오기
  useEffect(() => {
    const loadMore = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/notices?page=${page}`);
        const newItems = response.data.data;
        

        // 중복 방지 로직
        setItems((prev) => {
          const existingIds = new Set(prev.map((item) => item.notice_id));
          const uniqueNewItems = newItems.filter((item) => !existingIds.has(item.notice_id));
          return [...prev, ...uniqueNewItems];
        });
        
  
        if (newItems.length === 0 || newItems.length < 10) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('공지사항 불러오기 실패:', error);
      }
    };
  
    if (hasMore) {
      loadMore(); // ✔️ page !== 1 조건 제거
    }
  }, [page, hasMore]);
  
  

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
    if (showSignIn || showSignUp || showNotice) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [showSignIn, showSignUp, showNotice]);

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
      const noticeTextWrap = document.querySelector('.notice_text_wrap');

      if (
        (noticeTable && noticeTable.contains(e.target)) ||
        (noticeText && noticeText.contains(e.target)) ||
        (noticeTextWrap && noticeTextWrap.contains(e.target))
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
      const noticeWrap = document.querySelector('.notice_text_wrap');
  
      if (
        noticeRef.current &&
        !noticeRef.current.contains(event.target) &&
        !noticeWrap?.contains(event.target) &&
        event.target.id !== 'notice_img'
      ) {
        setIsNoticeOpen(false); // 리스트만 닫힘
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
  const handleItemClick = async (noticeId) => {
    console.log('Clicked notice ID:', noticeId); // ID가 제대로 전달되는지 확인
    try {
      const response = await axios.get(`http://localhost:5000/api/notices/${noticeId}`); // 공지사항 상세 정보 요청
      setNoticeDetail(response.data);
      setShowNotice(true); // 모달 열기
    } catch (error) {
      console.error('공지사항 상세 불러오기 실패:', error);
    }
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
              <div className="notice_table">
                {console.log("Items:", items)}  {/* items 배열 전체를 확인 */}
                {items.map((item, index) => {
                  console.log("Item:", item);  // 각 아이템을 로그로 출력
                  console.log("Notice ID:", item?.notice_id);  // notice_id를 안전하게 출력
                  
                  return (
                    <div
                      key={item?.notice_id || index}  // 각 공지사항 고유 ID 사용
                      className="notice_table_text"
                      onClick={() => handleItemClick(item?.notice_id)}  // 공지사항 ID로 클릭 이벤트 처리
                    >
                      {item?.title}  {/* 공지사항 제목 표시 */}
                    </div>
                  );
                })}
                {hasMore && <div ref={loader} style={{ height: '10px' }} />}
              </div>



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

      {/* 공지사항 상세 모달 표시 */}
      {showNotice && noticeDetail && (
        <div className="notice_text_wrap">
          <div className="notice_text_modal">
            <div className="notice_text">
              <div className="title">
                {noticeDetail.title}
              </div>

              {/* content가 HTML로 렌더링되도록 수정 */}
              <div className="text" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(noticeDetail.content) }} />

              <div className="exit_day">
                <p className="exit" onClick={() => setShowNotice(false)}>나가기</p>
                <p className="day">
                  {formatDate(noticeDetail.updated_at || noticeDetail.created_at)}
                </p>  {/* 날짜 포맷팅 */}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 로더 컴포넌트 */}
      <div ref={loader}></div>
    </div>
  );
}

export default MainPage;