import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';

import Header_Logo from '../components/Header_Logo/Header_Logo';
import Profile from '../components/Profile/Profile';
import Sign_in from '../components/Sign/Sign_inside/Sign_In/Sign_in';
import Sign_up from '../components/Sign/Sign_inside/Sign_Up/Sign_up';
import Footer from '../components/Footer/Footer';
import fullpage from 'fullpage.js';
import 'fullpage.js/dist/fullpage.min.css';
import '../styles/ThemePage.css';

import horror_background from '../assets/images/ThemePage_img/horror/horror_background.png';
import horror_stairs from '../assets/images/ThemePage_img/horror/horror_stairs.png';
import horror_top from '../assets/images/ThemePage_img/horror/horror_top.png';
import horror_room from '../assets/images/ThemePage_img/horror/horror_room.png';
import adventure_background from '../assets/images/ThemePage_img/adventure/adventure_background.png';
import crime_background from '../assets/images/ThemePage_img/crime/crime_background.png';

function ThemePage() {
    // URL 파라미터에서 theme 값을 가져옴
    const { theme } = useParams();

    // 로그인 및 회원가입 창 상태 관리
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const [items, setItems] = useState([]); // 아이템 상태 배열 (무한 스크롤로 점점 더 추가될 방 정보 등 저장)
    const observerRef = useRef(null); // 마지막 방 아이템을 감시할 IntersectionObserver 대상
    const scrollContainerRef = useRef(null); // 가로 스크롤이 적용될 div 요소를 참조 (스크롤 컨테이너)
    const scrollAmount = useRef(0); // 휠로 인한 스크롤 양
    const animationFrame = useRef(null); // requestAnimationFrame을 위한 참조
    const lastScrollTime = useRef(0); // 마지막 스크롤 시간 기록

    // 테마별 배경 이미지 매핑
    const backgroundMap = {
        horror: horror_background,
        adventure: adventure_background,
        crime: crime_background
    };

    // 테마별 계단 이미지 매핑
    const stairsMap = {
        horror: horror_stairs,
    };

    //테마별 TOP3 이미지 매핑
    const topMap = {
        horror: horror_top,
    }

    //테마별 Room 이미지 매핑
    const roomMap = {
        horror: horror_room,
    }

    // 현재 테마에 맞는 이미지 가져오기
    const backgroundImage = backgroundMap[theme] || horror_background;
    const stairsImage = stairsMap[theme] || horror_stairs;
    const topImage = topMap[theme] || horror_top;
    const roomImage = roomMap[theme] || horror_room;

    // theme 값이 없거나 배경 이미지가 없으면 아무것도 렌더링하지 않음
    if (!theme || !backgroundImage) return null;

    // fullpage.js 초기화 및 해제
    useEffect(() => {
        // 기존 fullpage 인스턴스 제거 (중복 방지)
        if (window.fullpage_api) {
            window.fullpage_api.destroy('all');
        }

        // 로그인, 회원가입 창이 안 떠 있을 때만 fullpage 초기화
        if (!showSignIn && !showSignUp) {
            new fullpage('#fullpage', {
                licenseKey: 'gplv3-license', // 무료 라이선스
                autoScrolling: true,
                navigation: false,
            });
        }

        // 컴포넌트 언마운트 시 fullpage 정리
        return () => {
            if (window.fullpage_api) {
                window.fullpage_api.destroy('all');
            }
        };
    }, [showSignIn, showSignUp, theme]);

    // 로그인/회원가입 시 스크롤 비활성화
    useEffect(() => {
        if (showSignIn || showSignUp) {
            document.body.style.overflow = 'hidden';
            if (window.fullpage_api) {
                window.fullpage_api.setAllowScrolling(false);
            }
        } else {
            document.body.style.overflow = '';
            if (window.fullpage_api) {
                window.fullpage_api.setAllowScrolling(true);
            }
        }
    }, [showSignIn, showSignUp]);

    // 새로운 아이템 로드
    const loadMoreItems = () => {
        setItems((prev) => [
            ...prev,
            ...Array.from({ length: 10 }, (_, i) => prev.length + i + 1) // 숫자 배열로 추가
        ]);
    };

    // IntersectionObserver를 사용하여 마지막 아이템이 화면에 보일 때마다 로드
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreItems();
                }
            },
            { root: scrollContainerRef.current, threshold: 1.0 }
        );

        if (observerRef.current) observer.observe(observerRef.current);

        return () => observer.disconnect();
    }, []);

    // 마우스 휠 이벤트로 가로 스크롤
    useEffect(() => {
        const handleWheel = (e) => {
            e.preventDefault(); // 기본 수직 스크롤 방지

            // 휠 방향에 따라 가로 스크롤
            const scrollDelta = e.deltaY * 0.2; // 속도 조절
            scrollAmount.current += scrollDelta;
            scrollContainerRef.current.scrollLeft += scrollDelta;

            // 가로 스크롤 끝에 가까워졌을 때 새로운 아이템 로드
            const container = scrollContainerRef.current;
            const scrollPosition = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const containerWidth = container.clientWidth;

            // 스크롤이 끝에 거의 도달했을 때 (남은 공간이 200px 이하일 때)
            if (scrollWidth - scrollPosition - containerWidth < 200) {
                loadMoreItems(); // 새로운 아이템 로드
            }

            // 스크롤이 멈춘 후 감속 적용
            const now = Date.now();
            const timeElapsed = now - lastScrollTime.current;

            // 일정 시간이 지난 후 감속 처리
            if (timeElapsed > 50) {
                lastScrollTime.current = now;
                cancelAnimationFrame(animationFrame.current);
                animationFrame.current = requestAnimationFrame(smoothScroll);
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel); // 마우스 휠 이벤트 처리
        }

        return () => {
            if (container) container.removeEventListener('wheel', handleWheel);
            cancelAnimationFrame(animationFrame.current);
        };
    }, []);

    // 마우스 진입/퇴장 시 스크롤 제어
    useEffect(() => {
        const container = scrollContainerRef.current;

        const handleMouseEnter = () => {
            if (window.fullpage_api) {
                window.fullpage_api.setAllowScrolling(false);
            }
        };

        const handleMouseLeave = () => {
            if (!showSignIn && !showSignUp && window.fullpage_api) {
                window.fullpage_api.setAllowScrolling(true);
            }
        };

        if (container) {
            container.addEventListener('mouseenter', handleMouseEnter);
            container.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            if (container) {
                container.removeEventListener('mouseenter', handleMouseEnter);
                container.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [showSignIn, showSignUp]);

    // 감속 스크롤 함수
    const smoothScroll = () => {
        if (Math.abs(scrollAmount.current) > 0.5) {
            scrollAmount.current *= 0.9; // 감속 효과
            scrollContainerRef.current.scrollLeft += scrollAmount.current;

            animationFrame.current = requestAnimationFrame(smoothScroll);
        }
    };

    // 로그인 버튼 클릭 시
    const handleSignInClick = () => {
        setShowSignIn(true);
        setShowSignUp(false);
    };

    // 회원가입 버튼 클릭 시
    const handleSignUpClick = () => {
        setShowSignIn(false);
        setShowSignUp(true);
    };

    // 로그인 창 닫기
    const handleCloseSignIn = () => setShowSignIn(false);

    // 회원가입 창 닫기
    const handleCloseSignUp = () => setShowSignUp(false);

    return (
        <>
            {/* fullpage.js의 각 section */}
            <div id="fullpage">
                {/* 첫 번째 섹션 */}
                <div className="section">
                    <div className='theme_wrap'>
                        {/* 배경 이미지 */}
                        <img id="theme_background" src={backgroundImage} alt="theme_background" />

                        {/* 헤더 영역: 로고 + 프로필 */}
                        <header className="theme_header">
                            <Header_Logo />
                            <Profile onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
                        </header>

                        {/* 테마 콘텐츠 영역: 랭크 + TOP3 */}
                        <div className='theme_hit_rank_floor'>
                            <div className='theme_hit_rank'>
                                <div className='theme_rank'>
                                    <div className='rank'>

                                    </div>
                                </div>

                                <div className='theme_hit'>
                                    <div className='theme_door_hit1'>
                                        <div className='top1'>
                                            <div className='theme_door_top1'>
                                                <img id='theme_door_top_img' src={topImage} alt='theme_door_top_img' />

                                                <p>TOP 1</p>
                                            </div>
                                        </div>

                                        <div className='door_top1'>

                                        </div>
                                    </div>

                                    <div className='theme_door_hit2'>
                                        <div className='top2'>
                                            <div className='theme_door_top2'>
                                                <img id='theme_door_top_img' src={topImage} alt='theme_door_top_img' />

                                                <p>TOP 2</p>
                                            </div>
                                        </div>

                                        <div className='door_top2'>
                                            
                                        </div>
                                    </div>

                                    <div className='theme_door_hit3'>
                                        <div className='top3'>
                                            <div className='theme_door_top3'>
                                                <img id='theme_door_top_img' src={topImage} alt='theme_door_top_img' />

                                                <p>TOP 3</p>
                                            </div>
                                        </div>

                                        <div className='door_top3'>
                                            
                                        </div>
                                    </div>  
                                </div>
                            </div>

                            {/* 중간 구조물(계단 + 복도) */}
                            <div className='floor'>
                                <img id='theme_stairs' src={stairsImage} alt='theme_stairs' />
                                <div className='hallway'></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 두 번째 섹션 - 테마 복도 */}
                <div className="section">
                    <div className='theme_wrap'>
                        {/* 배경 이미지 */}
                        <img id="theme_background" src={backgroundImage} alt="theme_background" />

                        <div className='theme_door_infinite'>
                            {/* 정렬 및 검색 영역 (현재 비어있음) */}
                            <div className='sort_search'></div>

                            {/* 가로 무한 스크롤 영역 */}
                            <div className='infinite' ref={scrollContainerRef}>
                                {items.map((_, index) => (
                                    <div key={index} className="theme_door_room">
                                        {/* 방 번호와 이미지 */}
                                        <div className="theme_room">
                                            <div className='room'>
                                                <img id='theme_room_img' src={roomImage} alt='theme_room_img' />
                                                <p>{401 + index}</p>
                                            </div>
                                        </div>

                                        {/* 각 방에 연결된 문 영역 */}
                                        <div className='theme_door'></div>
                                    </div>
                                ))}

                                {/* 무한 스크롤 감지를 위한 감시 대상 요소 */}
                                <div ref={observerRef} style={{ width: '20px' }}></div>
                            </div>

                            {/* 복도 바닥 */}
                            <div className='hallway'></div>
                        </div>
                    </div>
                </div>

                {/* 세 번째 섹션: 푸터 */}
                <div className="section footer_section">
                    <Footer />
                </div>
            </div>

            {/* 로그인 / 회원가입 모달 */}
            {showSignIn && <Sign_in onClose={handleCloseSignIn} onSignUpClick={handleSignUpClick} />}
            {showSignUp && <Sign_up onClose={handleCloseSignUp} onSignInClick={handleSignInClick} />}
        </>
    );
}

export default ThemePage;