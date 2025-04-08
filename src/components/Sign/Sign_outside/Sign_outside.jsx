import React from 'react';

import './Sign_outside.css';

import sign_in from '../../../assets/images/Sign/Sign_In.png';
import sign_up from '../../../assets/images/Sign/Sign_Up.png';

function Sign_outside({ onSignInClick, onSignUpClick }) {
  return (
    <div className='Sign'>
      <img
          id='sign_in'
          src={sign_in}
          alt='sign_in'
          onClick={onSignInClick}
      />

      <img
          id='sign_up'
          src={sign_up}
          alt='sign_up'
          onClick={onSignUpClick}
      />
    </div>
  );
}

export default Sign_outside;