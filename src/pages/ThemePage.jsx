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
    // URL 파라미터에서 theme 값 가져오기
    const { theme } = useParams();

    // 로그인 및 회원가입 상태
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const [items, setItems] = useState([]); // 아이템 상태 배열
    const observerRef = useRef(null); // IntersectionObserver 대상
    const scrollContainerRef = useRef(null); // 가로 스크롤 컨테이너
    const scrollAmount = useRef(0); // 휠 스크롤 양
    const animationFrame = useRef(null); // requestAnimationFrame 참조
    const lastScrollTime = useRef(0); // 마지막 스크롤 시간

    const [animatedIndexes, setAnimatedIndexes] = useState([]); // 애니메이션 인덱스 상태
    const section2Ref = useRef(null); // 섹션2 참조
    const [section2Visible, setSection2Visible] = useState(false); // 섹션2 보이는지 여부
    const [isAnimating, setIsAnimating] = useState(false); // 애니메이션 상태

    // 테마별 이미지 매핑
    const backgroundMap = {
        horror: horror_background,
        adventure: adventure_background,
        crime: crime_background
    };
    const stairsMap = {
        horror: horror_stairs,
    };
    const topMap = {
        horror: horror_top,
    };
    const roomMap = {
        horror: horror_room,
    };

    // 테마에 맞는 이미지 가져오기
    const backgroundImage = backgroundMap[theme] || horror_background;
    const stairsImage = stairsMap[theme] || horror_stairs;
    const topImage = topMap[theme] || horror_top;
    const roomImage = roomMap[theme] || horror_room;

    // theme 없거나 배경 이미지 없으면 렌더링 안함
    if (!theme || !backgroundImage) return null;

    // fullpage.js 초기화 및 해제
    useEffect(() => {
        if (window.fullpage_api) {
            window.fullpage_api.destroy('all'); // 기존 fullpage 인스턴스 제거
        }

        if (!showSignIn && !showSignUp) {
            new fullpage('#fullpage', { licenseKey: 'gplv3-license', autoScrolling: true, navigation: false });
        }

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
            if (window.fullpage_api) window.fullpage_api.setAllowScrolling(false);
        } else {
            document.body.style.overflow = '';
            if (window.fullpage_api) window.fullpage_api.setAllowScrolling(true);
        }
    }, [showSignIn, showSignUp]);

    // 새로운 아이템 로드
    const loadMoreItems = () => {
        setItems((prev) => [
            ...prev,
            ...Array.from({ length: 10 }, (_, i) => prev.length + i + 1)
        ]);
    };

    // IntersectionObserver로 섹션2 보이면 애니메이션 시작
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setSection2Visible(true);
                    setIsAnimating(true); // 애니메이션 시작
                }
            },
            { threshold: 0.01 }
        );

        if (section2Ref.current) observer.observe(section2Ref.current);

        return () => {
            if (section2Ref.current) observer.unobserve(section2Ref.current);
        };
    }, []);

    // 애니메이션 끝나면 스크롤 활성화
    useEffect(() => {
        if (section2Visible) {
            const initialCount = 4;
            const delays = Array.from({ length: initialCount }, (_, i) => i);
            setAnimatedIndexes(delays);

            setIsAnimating(true);
            document.body.style.overflow = 'hidden'; // 스크롤 비활성화

            const timeout = setTimeout(() => {
                setIsAnimating(false);
                document.body.style.overflow = ''; // 스크롤 활성화
            }, initialCount * 300 + 300); // 애니메이션 후 버퍼시간

            return () => clearTimeout(timeout);
        }
    }, [section2Visible]);

    // IntersectionObserver로 마지막 아이템이 보이면 로드
    useEffect(() => {
        if (isAnimating) return;

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
    }, [isAnimating]);

    // 휠 이벤트로 가로 스크롤
    useEffect(() => {
        const handleWheel = (e) => {
            if (isAnimating) {
                e.preventDefault();
                return;
            }

            e.preventDefault();

            const scrollDelta = e.deltaY * 0.2;
            scrollAmount.current += scrollDelta;
            scrollContainerRef.current.scrollLeft += scrollDelta;

            const container = scrollContainerRef.current;
            const scrollPosition = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const containerWidth = container.clientWidth;

            if (scrollWidth - scrollPosition - containerWidth < 200) {
                loadMoreItems(); // 새로운 아이템 로드
            }

            const now = Date.now();
            const timeElapsed = now - lastScrollTime.current;

            if (timeElapsed > 50) {
                lastScrollTime.current = now;
                cancelAnimationFrame(animationFrame.current);
                animationFrame.current = requestAnimationFrame(smoothScroll);
            }
        };

        const container = scrollContainerRef.current;
        if (container) {
            container.addEventListener('wheel', handleWheel);
        }

        return () => {
            if (container) container.removeEventListener('wheel', handleWheel);
            cancelAnimationFrame(animationFrame.current);
        };
    }, [isAnimating]);

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
            scrollAmount.current *= 0.9;
            scrollContainerRef.current.scrollLeft += scrollAmount.current;

            animationFrame.current = requestAnimationFrame(smoothScroll);
        }
    };

    // 로그인/회원가입 클릭 시 상태 변경
    const handleSignInClick = () => {
        setShowSignIn(true);
        setShowSignUp(false);
    };

    const handleSignUpClick = () => {
        setShowSignIn(false);
        setShowSignUp(true);
    };

    // 로그인/회원가입 창 닫기
    const handleCloseSignIn = () => setShowSignIn(false);
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
                <div className="section" ref={section2Ref}>
                    <div className='theme_wrap'>
                        {/* 배경 이미지 */}
                        <img id="theme_background" src={backgroundImage} alt="theme_background" />

                        <div className='theme_door_infinite'>
                            {/* 정렬 및 검색 영역 (현재 비어있음) */}
                            <div className='sort_search'></div>

                            {/* 가로 무한 스크롤 영역 */}
                            <div className='infinite' ref={scrollContainerRef}>
                                {items.map((_, index) => (
                                    <div
                                        key={index}
                                        className={`theme_door_room ${section2Visible && animatedIndexes.includes(index) ? 'animate' : ''}`}
                                        style={animatedIndexes.includes(index) ? { animationDelay: `${index * 0.3}s` } : {}}
                                    >
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