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

import search_icon from '../assets/images/ThemePage_img/search_icon.png';
import horror_background from '../assets/images/ThemePage_img/horror/horror_background.png';
import horror_stairs from '../assets/images/ThemePage_img/horror/horror_stairs.png';
import horror_top from '../assets/images/ThemePage_img/horror/horror_top.png';
import horror_room from '../assets/images/ThemePage_img/horror/horror_room.png';
import horror_down_arrow from '../assets/images/ThemePage_img/horror/horror_down_arrow.png';
import horror_right_arrow from '../assets/images/ThemePage_img/horror/horror_right_arrow.png';
import horror_top1_img from '../assets/images/ThemePage_img/horror/horror_top1_img.png';
import horror_top2_img from '../assets/images/ThemePage_img/horror/horror_top2_img.png';
import horror_top3_img from '../assets/images/ThemePage_img/horror/horror_top3_img.png';
import horror_door1_img from '../assets/images/ThemePage_img/horror/horror_door1_img.png';
import horror_door2_img from '../assets/images/ThemePage_img/horror/horror_door2_img.png';
import horror_door3_img from '../assets/images/ThemePage_img/horror/horror_door3_img.png';
import horror_door4_img from '../assets/images/ThemePage_img/horror/horror_door4_img.png';
import horror_rating_star from '../assets/images/ThemePage_img/horror/horror_rating_star.png';
import horror_difficulty_img from '../assets/images/ThemePage_img/horror/horror_difficulty_img.png';
import adventure_background from '../assets/images/ThemePage_img/adventure/adventure_background.png';
import adventure_rating_star from '../assets/images/ThemePage_img/adventure/adventure_rating_star.png';
import adventure_difficulty_img from '../assets/images/ThemePage_img/adventure/adventure_difficulty_img.png';
import crime_background from '../assets/images/ThemePage_img/crime/crime_background.png';
import crime_rating_star from '../assets/images/ThemePage_img/crime/crime_rating_star.png';
import crime_difficulty_img from '../assets/images/ThemePage_img/crime/crime_difficulty_img.png';

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

    const hasAnimated = useRef(false); // 두 번째 섹션 애니메이션 실행 여부 저장
    const hasAnimated2 = useRef(false); // 첫 번째 애니메이션 실행 여부 저장
    const [shouldAnimate, setShouldAnimate] = useState(false); // 첫 번째 애니메이션 실행 여부

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
    const downarrowMap = {
        horror: horror_down_arrow,
    };
    const rightarrowMap = {
        horror: horror_right_arrow,
    };
    const starMap = {
        horror: horror_rating_star,
        adventure: adventure_rating_star,
        crime: crime_rating_star
    };
    const difficultyMap = {
        horror: horror_difficulty_img,
        adventure: adventure_difficulty_img,
        crime: crime_difficulty_img
    };

    // 테마에 맞는 이미지 가져오기
    const backgroundImage = backgroundMap[theme] || horror_background;
    const stairsImage = stairsMap[theme] || horror_stairs;
    const topImage = topMap[theme] || horror_top;
    const roomImage = roomMap[theme] || horror_room;
    const downarrowImage = downarrowMap[theme] || horror_down_arrow;
    const rightarrowImage = rightarrowMap[theme] || horror_right_arrow;
    const starImage = starMap[theme] || horror_rating_star;
    const difficultyImage = difficultyMap[theme] || horror_difficulty_img;

    // theme 없거나 배경 이미지 없으면 렌더링 안함
    if (!theme || !backgroundImage) return null;

    const top1_difficulty = 5;
    const top2_difficulty = 3;
    const top3_difficulty = 4;

    const horrorDoorImages = [
        horror_door1_img,
        horror_door2_img,
        horror_door3_img,
        horror_door4_img
    ];

    const doorData = [
        { rating: 4.8, reviews: '1,927', title: '괴물', difficulty: 3 },
        { rating: 4.8, reviews: '1,234', title: '폐쇄병동', difficulty: 2 },
        { rating: 4.7, reviews: '1,850', title: '500원짜리 문방구 공포집', difficulty: 5 },
        { rating: 4.6, reviews: '2,100', title: 'Conjuring House', difficulty: 5 },
    ];

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
                } else {
                    setSection2Visible(false);
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
        // 이미 애니메이션 실행한 적 있다면 무시
        if (hasAnimated.current) return;
    
        if (section2Visible) {
            setIsAnimating(true);
            document.body.style.overflow = 'hidden';
    
            const initialCount = 4;
            const delays = Array.from({ length: initialCount }, (_, i) => i);
            setAnimatedIndexes(delays);
    
            const timeout = setTimeout(() => {
                setIsAnimating(false);
                document.body.style.overflow = '';
                hasAnimated.current = true; // 다시는 실행되지 않도록
            }, initialCount * 400 + 400);
    
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

    // 첫 번째 섹션 애니메이션 한 번만 실행되게 변경
    useEffect(() => {
        if (!hasAnimated2.current) {
          setShouldAnimate(true);
          hasAnimated2.current = true;
        }
    }, []);

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
    const handleCloseSignIn = () => {setShowSignIn(false); setShouldAnimate(false);}
    const handleCloseSignUp = () => {setShowSignUp(false); setShouldAnimate(false);}

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
                                    <div className={`theme_door_hit1 ${theme} ${shouldAnimate ? 'animate' : 'standard'}`}>
                                        <div className='top1'>
                                            <div className='theme_door_top1'>
                                                <img id='theme_door_top_img' src={topImage} alt='theme_door_top_img' />

                                                <p>TOP 1</p>
                                            </div>
                                        </div>

                                        <div className='door_top1'>
                                            <img id='theme_top1_img' src={horror_top1_img} alt='theme_top1_img' />

                                            <div className='theme_top1_data'>
                                                <div className='difficulty_rating'>
                                                    <div className='rating'>
                                                        <img id='theme_rating_star' src={starImage} alt='theme_rating_star' />

                                                        <p className='rating_text'>5.0 (3,455)</p>
                                                    </div>

                                                    <div className='difficulty'>
                                                        {Array.from({ length: top1_difficulty }).map((_, index) => (
                                                            <img 
                                                                key={index}
                                                                id='theme_difficulty_img' 
                                                                src={difficultyImage} 
                                                                alt='theme_difficulty_img' 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className='theme_top1_title'>나의 식인 룸메이트</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`theme_door_hit2 ${theme} ${shouldAnimate ? 'animate' : 'standard'}`}>
                                        <div className='top2'>
                                            <div className='theme_door_top2'>
                                                <img id='theme_door_top_img' src={topImage} alt='theme_door_top_img' />

                                                <p>TOP 2</p>
                                            </div>
                                        </div>

                                        <div className='door_top2'>
                                            <img id='theme_top2_img' src={horror_top2_img} alt='theme_top2_img' />

                                            <div className='theme_top2_data'>
                                                <div className='difficulty_rating'>
                                                    <div className='rating'>
                                                        <img id='theme_rating_star' src={starImage} alt='theme_rating_star' />

                                                        <p className='rating_text'>4.9 (2,129)</p>
                                                    </div>

                                                    <div className='difficulty'>
                                                        {Array.from({ length: top2_difficulty }).map((_, index) => (
                                                            <img 
                                                                key={index}
                                                                id='theme_difficulty_img' 
                                                                src={difficultyImage} 
                                                                alt='theme_difficulty_img' 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className='theme_top2_title'>그림커티</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`theme_door_hit3 ${theme} ${shouldAnimate ? 'animate' : 'standard'}`}>
                                        <div className='top3'>
                                            <div className='theme_door_top3'>
                                                <img id='theme_door_top_img' src={topImage} alt='theme_door_top_img' />

                                                <p>TOP 3</p>
                                            </div>
                                        </div>

                                        <div className='door_top3'>
                                            <img id='theme_top3_img' src={horror_top3_img} alt='theme_top3_img' />

                                            <div className='theme_top3_data'>
                                                <div className='difficulty_rating'>
                                                    <div className='rating'>
                                                        <img id='theme_rating_star' src={starImage} alt='theme_rating_star' />

                                                        <p className='rating_text'>4.9 (1,927)</p>
                                                    </div>

                                                    <div className='difficulty'>
                                                        {Array.from({ length: top3_difficulty }).map((_, index) => (
                                                            <img 
                                                                key={index}
                                                                id='theme_difficulty_img' 
                                                                src={difficultyImage} 
                                                                alt='theme_difficulty_img' 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                <p className='theme_top3_title'>미스터리모험</p>
                                            </div>
                                        </div>
                                    </div>  
                                </div>
                            </div>

                            <img id='theme_down_arrow' src={downarrowImage} alt='theme_down_arrow' />

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
                            {/* 정렬 및 검색 영역 */}
                            <div className='sort_search_wrap'>
                                <div className='sort_search_arrow'>
                                    <img id='theme_right_arrow' src={rightarrowImage} alt='theme_right_arrow' />
                                    
                                    <div className='sort_search'>
                                        <div className='search'>
                                            <img id='search_icon' src={search_icon} alt='search_icon' />
                                            <input className='door_search' type='text' placeholder="제목 검색"/>
                                        </div>
                                        
                                        <h1 className='sort'>평점 순</h1>
                                    </div>
                                </div>
                            </div>

                            {/* 가로 무한 스크롤 영역 */}
                            <div className='infinite' ref={scrollContainerRef}>
                                {items.map((_, index) => {
                                    const roomNumber = 401 + index;

                                    // 방 번호에 맞게 이미지를 순차적으로 할당 (401번은 door1, 402번은 door2 ...)
                                    const doorImageIndex = (roomNumber - 401) % 4;

                                    // 아이템에 해당하는 데이터 가져오기 (예: 평점, 제목, 난이도)
                                    const { rating, reviews, title, difficulty } = doorData[index % doorData.length]; // 데이터 순환

                                    return (
                                        <div
                                            key={index}
                                            className={`theme_door_room ${theme} ${
                                                section2Visible && animatedIndexes.includes(index) && !hasAnimated.current
                                                    ? 'animate'
                                                    : ''
                                            }`}
                                            style={
                                                section2Visible && animatedIndexes.includes(index) && !hasAnimated.current
                                                    ? { animationDelay: `${index * 0.3}s` }
                                                    : {}
                                            }
                                        >
                                            {/* 방 번호와 이미지 */}
                                            <div className="theme_room">
                                                <div className='room'>
                                                    <img id='theme_room_img' src={roomImage} alt='theme_room_img' />
                                                    <p>{roomNumber}</p> {/* 동적으로 방 번호 표시 */}
                                                </div>
                                            </div>

                                            {/* 각 방에 연결된 문 영역 */}
                                            <div className='theme_door'>
                                                {/* 반복적으로 이미지를 표시 (순차적으로 이미지가 반복됨) */}
                                                <img
                                                    id='theme_door_img'
                                                    src={horrorDoorImages[doorImageIndex]} // 이미지 인덱스를 통해 반복
                                                    alt={`theme_door_img_${doorImageIndex}`}
                                                />

                                                <div className='theme_door_data'>
                                                    <div className='difficulty_rating'>
                                                        <div className='rating'>
                                                            <img id='theme_rating_star' src={starImage} alt='theme_rating_star' />
                                                            <p className='rating_text'>{rating} ({reviews})</p>
                                                        </div>

                                                        <div className='difficulty'>
                                                            {Array.from({ length: difficulty }).map((_, index) => (
                                                                <img 
                                                                    key={index}
                                                                    id='theme_difficulty_img' 
                                                                    src={difficultyImage} 
                                                                    alt='theme_difficulty_img' 
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <p className='theme_door_title'>{title}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}

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