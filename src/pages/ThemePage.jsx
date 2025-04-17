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
import adventure_background from '../assets/images/ThemePage_img/adventure/adventure_background.png';

function ThemePage() {
    const { theme } = useParams();
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    const backgroundMap = {
        horror: horror_background,
        adventure: adventure_background,
    };

    const backgroundImage = backgroundMap[theme];

    // 🛑 theme가 없으면 아무것도 렌더링하지 않음
    if (!theme || !backgroundImage) return null;

    useEffect(() => {
        // fullpage 중복 초기화 방지용
        if (window.fullpage_api) {
            window.fullpage_api.destroy('all');
        }

        if (!showSignIn && !showSignUp) {
            new fullpage('#fullpage', {
                licenseKey: 'gplv3-license',
                autoScrolling: true,
                navigation: false,
            });
        }

        return () => {
            if (window.fullpage_api) {
                window.fullpage_api.destroy('all');
            }
        };
    }, [showSignIn, showSignUp, theme]);

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

    const handleSignInClick = () => {
        setShowSignIn(true);
        setShowSignUp(false);
    };

    const handleSignUpClick = () => {
        setShowSignIn(false);
        setShowSignUp(true);
    };

    const handleCloseSignIn = () => setShowSignIn(false);
    const handleCloseSignUp = () => setShowSignUp(false);

    return (
        <>
            <div id="fullpage">
                <div className="section">
                    <img id="theme_background" src={backgroundImage} alt="theme_background" />

                    <header className="theme_header">
                        <Header_Logo />
                        <Profile onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
                    </header>
                </div>

                <div className="section">
                    <img id="theme_background" src={backgroundImage} alt="theme_background" />
                </div>

                <div className="section footer_section">
                    <Footer />
                </div>
            </div>

            {showSignIn && <Sign_in onClose={handleCloseSignIn} onSignUpClick={handleSignUpClick} />}
            {showSignUp && <Sign_up onClose={handleCloseSignUp} onSignInClick={handleSignInClick} />}
        </>
    );
}

export default ThemePage;