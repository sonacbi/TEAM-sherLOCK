import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import './Header_Logo.css';

import header_logo from '../../assets/images/logo/header_logo.png';

function Header_Logo() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === '/Main') {
      navigate('/Intro');
    } else {
      navigate('/Main');
    }
  };

  return (
    <div 
      className='header_logo'
      tabIndex="0"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleClick();
      }}
    >
      <img
        id='sherlock'
        src={header_logo}
        alt='sherlock'
      /> 

      <p>방탈출 창작 & 공유 플랫폼</p>
    </div>
  );
}

export default Header_Logo;