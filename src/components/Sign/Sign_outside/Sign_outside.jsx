import React from 'react';

import './Sign_outside.css';

import sign_in from '../../../assets/images/Sign/Sign_In.png';
import sign_up from '../../../assets/images/Sign/Sign_Up.png';

function Sign_outside() {
  return (
    <div className='Sign'>
        <img
            id='sign_in'
            src={sign_in}
            alt='sign_in'
        />

        <img
            id='sign_up'
            src={sign_up}
            alt='sign_up'
        />
    </div>
  );
}

export default Sign_outside;