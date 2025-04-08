import React, { useState } from 'react';

import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_in.css';

import kakao from '../../../../assets/images/Sign/Kakao.png';
import Sign_up from '../../../../assets/images/Sign/Sign_Up.png';
import X from '../../../../assets/images/Sign/X.png';

function Sign_in({ onClose, onSignUpClick }) {
  const [showSherlockLogin, setShowSherlockLogin] = useState(false);

  const handleSherlockLoginClick = () => {
    setShowSherlockLogin(true);
  };

  const handleSignUpClick = () => {
    onSignUpClick();
  };

  return (
    <div className='Sign_in'>
      <div className='Sign_content'>
        <img id='X' src={X} alt='X' onClick={onClose} />

        <Logo />

        <div className='login'>
          {!showSherlockLogin && (
            <div className='kakao_sherlock'>
              <div className='kakao_login'>
                <img id='kakao' src={kakao} alt='kakao' />
                <p>Kakao로 로그인</p>
              </div>

              <div className='sherlock_login' onClick={handleSherlockLoginClick}>
                <p>셜LOCK ID 로그인</p>
              </div>
            </div>
          )}

          {showSherlockLogin && (
            <>
              <div className='sherlock'>
                <form>
                  <div className='id'>
                    <input type='text' placeholder="셜LOCK ID" />
                  </div>

                  <div className='password'>
                    <input type='password' placeholder="비밀번호" />
                  </div>

                  <div className='button'>
                    <button>로그인</button>
                  </div>
                </form>
              </div>

              <div className='kakao_hidden'>
                <div className='kakao_login2'>
                  <img id='kakao' src={kakao} alt='kakao' />
                  <p>Kakao로 로그인</p>
                </div>
              </div>
            </>
          )}
        </div>

        <div className={`Sign_up_img ${showSherlockLogin ? 'move-down' : ''}`}>
          <img id='Sign_up' src={Sign_up} alt='Sign_up' onClick={handleSignUpClick}/>
        </div>
      </div>
    </div>
  );
}

export default Sign_in;