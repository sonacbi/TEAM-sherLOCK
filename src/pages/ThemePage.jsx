import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

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
    const fullpageRef = useRef(null);
    const [showSignIn, setShowSignIn] = useState(false);
    const [showSignUp, setShowSignUp] = useState(false);

    useEffect(() => {
        if (showSignIn || showSignUp) return;
    
        fullpageRef.current = new fullpage('#fullpage', {
            licenseKey: 'gplv3-license',
            autoScrolling: true,
            navigation: false,
        });
    
        return () => {
            // showSignIn/showSignUp 중에는 destroy 생략
            if (!showSignIn && !showSignUp && fullpageRef.current) {
                const fullpageEl = document.getElementById('fullpage');
                if (fullpageEl && fullpageEl.children.length > 0) {
                    fullpageRef.current.destroy('all');
                    fullpageRef.current = null;
                }
            }
        };
    }, [showSignIn, showSignUp]);

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

    const backgroundMap = {
        horror: horror_background,
        adventure: adventure_background
    };

    const backgroundImage = backgroundMap[theme];

    return (
        <>
            <div id="fullpage">
                <div className="section">
                    <img id='theme_background' src={backgroundImage} alt='theme_background'/>

                    <header>
                        <Profile onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
                    </header>
                </div>

                <div className="section">
                    <img id='theme_background' src={backgroundImage} alt='theme_background'/>
                </div>

                <div className="section footer_section">
                    <Footer />
                </div>
            </div>

            {showSignIn && <Sign_in onClose={handleCloseSignIn} onSignUpClick={handleSignUpClick}/>}
            {showSignUp && <Sign_up onClose={handleCloseSignUp} onSignInClick={handleSignInClick}/>}
        </>
    );
}

export default ThemePage;