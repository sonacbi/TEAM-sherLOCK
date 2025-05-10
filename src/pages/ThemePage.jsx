import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

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

import { FilterSetting } from '../../modules/filters';

function ThemePage() {
    // URL 파라미터에서 theme 값 가져오기
    const { theme } = useParams();

    // 로그인 및 회원가입 상태
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const [games, setGames] = useState([]); // 아이템 상태 배열
    const searchWord = useRef(''); // 검색어
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

    const navigate = useNavigate();

    const [showSortType, setShowSortType] = useState(false);
    const [selectedSort, setSelectedSort] = useState(FilterSetting.rating_desc); // 초기 표시 텍스트
    const timeoutRef = useRef(null); // 타이머 ID 저장용

    const [difficulty, setDifficulty] = useState(null);

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

    const doorData = [
        { rating: 4.8, reviews: '1,927' },
        { rating: 4.8, reviews: '1,234' },
        { rating: 4.7, reviews: '1,850' },
        { rating: 4.6, reviews: '2,100' },
    ];

    // fullpage.js 초기화 및 해제
    useEffect(() => {
        // fullpage.js 초기화 및 제거
        if (window.fullpage_api) {
            window.fullpage_api.destroy('all'); // 기존 fullpage 인스턴스 제거
        }
    
        if (!showSignIn && !showSignUp) {
            new fullpage('#fullpage', { licenseKey: 'gplv3-license', autoScrolling: true, navigation: false });
        }
    
        return () => {
            if (window.fullpage_api) {
                window.fullpage_api.destroy('all'); // 컴포넌트 언마운트 시 fullpage 제거
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
    const loadMoreGames = async () => {
        if (isAnimating) {
            console.log("애니메이션 중 - 게임 로드 차단됨");
            return;
        }

        let filter;
        if (selectedSort == FilterSetting.rating_desc) filter = "created_at";
        else if (selectedSort == FilterSetting.rating_asc) filter = "created_at";
        else if (selectedSort == FilterSetting.latest_desc) filter = "created_at";
        else if (selectedSort == FilterSetting.play_desc) filter = "play_count DESC";
        else if (selectedSort == FilterSetting.play_asc) filter = "play_count ASC";

        const res = await fetch(`http://localhost:4000/games/${theme}?limit=${games.length + 50}&offset=${0}&search_keyword=${searchWord.current}&filter=${filter}&difficulty=${difficulty}`);
        const datas = await res.json();
        console.log('가져온 게임들: ', datas);
    
        // const keyword = searchWord.current.trim().toLowerCase();
        // const filtered = datas.filter(game =>
        //     game.title.toLowerCase().includes(keyword)
        // );
        // console.log('필터링된 게임들: ', filtered);
    
        // setGames([...filtered]); // 게임 리스트 업데이트
        setGames(datas); // 게임 리스트 업데이트
        // setGames(prev => {
        //     return [
        //         ...prev,
        //         ...datas
        //     ]
        // })

        console.log('games:',games)
    };

    const searchGames = () => {
        // 🔒 애니메이션 중이면 재실행 방지
        if (isAnimating) {
            console.log("애니메이션 중 - 검색 차단됨");
            return;
        }

        setGames([]);
        hasAnimated.current = false;
        setSection2Visible(true);
    
        loadMoreGames();
    
        setIsAnimating(true);
        if (window.fullpage_api) {
            window.fullpage_api.setAllowScrolling(false);
        }
    
        setTimeout(() => {
            setIsAnimating(false);
            hasAnimated.current = true;
        }, 4 * 400 + 400);
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
        // 애니메이션이 끝날 때 풀페이지 스크롤 활성화
        if (hasAnimated.current) return;
    
        if (section2Visible) {
            setIsAnimating(true);
    
            // 풀페이지 스크롤 비활성화
            if (window.fullpage_api) {
                window.fullpage_api.setAllowScrolling(false);
            }
    
            document.body.style.overflow = 'hidden';
            setAnimatedIndexes(Array.from({ length: 4 }, (_, i) => i));
    
            const timeout = setTimeout(() => {
                setIsAnimating(false);
                document.body.style.overflow = '';
    
                hasAnimated.current = true;
            }, 4 * 400 + 400); // 애니메이션 시간 맞추기
    
            return () => clearTimeout(timeout);
        }
    }, [section2Visible]);

    // IntersectionObserver로 마지막 아이템이 보이면 로드
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                // 애니메이션 중이면 스크롤을 무시
                if (isAnimating) return;
    
                if (entries[0].isIntersecting) {
                    console.log("좌측에서 랜더링됨");
                    loadMoreGames();
                }
            },
            { root: scrollContainerRef.current, threshold: 1.0 }
        );
    
        if (observerRef.current) observer.observe(observerRef.current);
    
        return () => observer.disconnect();
    }, [isAnimating]); // isAnimating 상태가 변경될 때마다 감지

    // 휠 이벤트로 가로 스크롤
    useEffect(() => {
        const handleWheel = (e) => {
            // 애니메이션 중이면 휠 이벤트를 막고 무한 스크롤만 활성화
            if (isAnimating) {
                e.preventDefault();
                return;
            }
    
            // 휠 이벤트로 가로 스크롤
            e.preventDefault();
    
            const scrollDelta = e.deltaY * 0.2;
            scrollAmount.current += scrollDelta;
            scrollContainerRef.current.scrollLeft += scrollDelta;
    
            const container = scrollContainerRef.current;
            const scrollPosition = container.scrollLeft;
            const scrollWidth = container.scrollWidth;
            const containerWidth = container.clientWidth;
    
            if (scrollWidth - scrollPosition - containerWidth < 200) {
                if (!isAnimating) {
                    loadMoreGames();
                    console.log("우측에서 랜더링됨");
                }
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
            if (!isAnimating && window.fullpage_api) {
                window.fullpage_api.setAllowScrolling(false);
            }
        };
    
        const handleMouseLeave = () => {
            if (!isAnimating && !showSignIn && !showSignUp && window.fullpage_api) {
                window.fullpage_api.setAllowScrolling(true);
            }
        };
    
        // ✅ 마우스 초기 위치 확인 (단, 애니메이션이 끝난 후에만)
        const handleInitialMousePosition = (e) => {
            if (!container || isAnimating) return;
    
            const rect = container.getBoundingClientRect();
            const isInside =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;
    
            if (!isInside && !showSignIn && !showSignUp && window.fullpage_api) {
                window.fullpage_api.setAllowScrolling(true);
            }
        };
    
        window.addEventListener('mousemove', handleInitialMousePosition, { once: true });
    
        if (container) {
            container.addEventListener('mouseenter', handleMouseEnter);
            container.addEventListener('mouseleave', handleMouseLeave);
        }
    
        return () => {
            window.removeEventListener('mousemove', handleInitialMousePosition);
            if (container) {
                container.removeEventListener('mouseenter', handleMouseEnter);
                container.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [isAnimating, showSignIn, showSignUp]);
    
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

    const handleSortClick = () => {
        // 기존 타이머 제거
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    
        setShowSortType(true);
        timeoutRef.current = setTimeout(() => {
            setShowSortType(false);
            timeoutRef.current = null;
        }, 3000);
    };

    const handleSelectSort = (sortText) => {
        setSelectedSort(sortText);
        setShowSortType(false);
        
        // 기존 타이머 제거
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        searchGames();
    };

    const handleDifficultyClick = (level) => {
        if (difficulty === level) {
            setDifficulty(null); // 같은 걸 누르면 해제
        } else {
            setDifficulty(level); // 다른 걸 누르면 선택
        }
        searchGames();
    };

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
                                            <form
                                                onSubmit={(event) => {
                                                    event.preventDefault();
                                                    searchWord.current = new FormData(event.target).get("door_search");
                                                    searchGames();
                                                }
                                                }
                                                autocomplete="off"
                                            >
                                                <input className='door_search' name='door_search' type='text' placeholder="제목 검색"/>
                                                <button type='submit' style={{display: "none"}}></button>
                                            </form>
                                        </div>
                                        
                                        <h1 className={`sort ${theme}`} onClick={handleSortClick}>
                                            {selectedSort == FilterSetting.rating_desc && "평점순 (↓)"}
                                            {selectedSort == FilterSetting.rating_asc && "평점순 (↑)"}
                                            {selectedSort == FilterSetting.latest_desc && "최신순"}
                                            {selectedSort == FilterSetting.play_desc && "플레이순 (↓)"}
                                            {selectedSort == FilterSetting.play_asc && "플레이순 (↑)"}
                                        </h1>
                                    </div>

                                    <div className='difficulty_filter'>
                                        <h2>난이도</h2>
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                className={`${level} ${theme} ${difficulty === level ? 'active' : ''}`}
                                                onClick={() => handleDifficultyClick(level)}
                                            >
                                                <h3>{level}</h3>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={`sort_type ${theme} ${showSortType ? 'visible' : 'hidden'}`}>
                                    <div className='sort_type1_wrap'>
                                        <h2 className={`${FilterSetting.rating_desc}`} onClick={() => handleSelectSort(FilterSetting.rating_desc)}>1. 평점순 (↓)</h2>
                                        <h2 className={`${FilterSetting.rating_asc}`} onClick={() => handleSelectSort(FilterSetting.rating_asc)}>2. 평점순 (↑)</h2>
                                        <h2 className={`${FilterSetting.view_desc}`} onClick={() => handleSelectSort(FilterSetting.latest_desc)}>3. 최신순</h2>
                                    </div>

                                    <div className='sort_type2_wrap'>
                                        <h2 className={`${FilterSetting.play_desc}`} onClick={() => handleSelectSort(FilterSetting.play_desc)}>4. 플레이순 (↓)</h2>
                                        <h2 className={`${FilterSetting.play_asc}`} onClick={() => handleSelectSort(FilterSetting.play_asc)}>5. 플레이순 (↑)</h2>
                                    </div>
                                </div>
                            </div>

                            {/* 가로 무한 스크롤 영역 */}
                            <div className='infinite' ref={scrollContainerRef}>
                                {games.length === 0 ? (
                                    <div className="no_games" key={searchWord.current}><h2><span style={{ fontSize: '18px' }}>검색: {searchWord.current}</span><br/>해당 제목의 방탈출이 존재하지 않습니다.</h2></div>
                                ) : (
                                    games.map((data, index) => {
                                        const roomNumber = 401 + index;
                                        const { rating, reviews } = doorData[index % doorData.length];

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
                                                onClick={() => navigate(`/game/${data.game_id}`)}
                                            >
                                                <div className="theme_room">
                                                    <div className='room'>
                                                        <img id='theme_room_img' src={roomImage} alt='theme_room_img' />
                                                        <p>{roomNumber}</p>
                                                    </div>
                                                </div>

                                                <div className='theme_door'>
                                                    <img
                                                        id='theme_door_img'
                                                        src={`../../server/games/${data.game_id}/${data.thumbnail}`}
                                                        alt={`theme_door_img_${data.thumbnail}`}
                                                    />
                                                    <div className='theme_door_data'>
                                                        <div className='difficulty_rating'>
                                                            <div className='rating'>
                                                                <img id='theme_rating_star' src={starImage} alt='theme_rating_star' />
                                                                <p className='rating_text'>{rating} ({reviews})</p>
                                                            </div>
                                                            <div className='difficulty'>
                                                                {Array.from({ length: data.difficulty }).map((_, index) => (
                                                                    <img 
                                                                        key={index}
                                                                        id='theme_difficulty_img' 
                                                                        src={difficultyImage} 
                                                                        alt='theme_difficulty_img' 
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <p className='theme_door_title'>{data.title}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

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