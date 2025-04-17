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
        fullpageRef.current = new fullpage('#fullpage', {
        licenseKey: 'gplv3-license',
        autoScrolling: true,
        navigation: false,
        });

        return () => {
        if (fullpageRef.current) {
            fullpageRef.current.destroy('all');
            fullpageRef.current = null;
        }
        };
    }, []);

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
        <div id="fullpage">
            <div className="section">
                <img id='theme_background' src={backgroundImage} alt='theme_background'/>

                <Profile onSignInClick={handleSignInClick} onSignUpClick={handleSignUpClick} />
                {showSignIn && <Sign_in onClose={handleCloseSignIn} onSignUpClick={handleSignUpClick}/>}
                {showSignUp && <Sign_up onClose={handleCloseSignUp} onSignInClick={handleSignInClick}/>}
            </div>

            <div className="section">
                <img id='theme_background' src={backgroundImage} alt='theme_background'/>
            </div>

            <div className="section footer_section">
                <Footer />
            </div>
        </div>
    );
}

export default ThemePage;