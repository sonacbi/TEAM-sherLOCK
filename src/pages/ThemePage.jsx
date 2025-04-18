import React, { useEffect, useState } from 'react';
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
import adventure_background from '../assets/images/ThemePage_img/adventure/adventure_background.png';
import crime_background from '../assets/images/ThemePage_img/crime/crime_background.png';

function ThemePage() {
    // URL 파라미터에서 theme 값을 가져옴
    const { theme } = useParams();

    // 로그인 및 회원가입 창 상태 관리
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

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

    // 현재 테마에 맞는 이미지 가져오기
    const backgroundImage = backgroundMap[theme] || horror_background;
    const stairsImage = stairsMap[theme] || horror_stairs;
    const topImage = topMap[theme] || horror_top;

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

                {/* 두 번째 섹션 (배경만 있음) */}
                <div className="section">
                    <img id="theme_background" src={backgroundImage} alt="theme_background" />
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