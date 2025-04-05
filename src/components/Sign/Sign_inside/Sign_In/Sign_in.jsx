import React from 'react';

import Logo from '../../../Header_Logo/Header_Logo';
import './Sign_in.css';

import kakao from '../../../../assets/images/Sign/Kakao.png';
import Sign_up from '../../../../assets/images/Sign/Sign_Up.png';
import X from '../../../../assets/images/Sign/X.png';

function Sign_in({ onClose }) {
  return (
    <div className='Sign_in'>
      <div className='Sign_content'>
        <img
          id='X'
          src={X}
          alt='X'
          onClick={ onClose }
        />
        
        <Logo />

        <div className='login'>
          <div className='hidden'>
            <div className='kakao_login'>
              <img
                id='kakao'
                src={kakao}
                alt='kakao'
              />

              <p>Kakao로 로그인</p>
            </div>

            <div className='sherlock_login'>
              <p>셜LOCK ID 로그인</p>
            </div>
          </div>  
        </div>

        <div className='Sign_up_img'>
          <img
            id='Sign_up'
            src={Sign_up}
            alt='Sign_up'
          />
        </div>
      </div>
    </div>
  );
}

export default Sign_in;