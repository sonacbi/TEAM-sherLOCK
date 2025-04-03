import React from 'react';

import Header_Logo from '../components/Header_Logo/Header_Logo';
import Sign from '../components/Sign/Sign_outside/Sign_outside';
import '../styles/MainPage.css';

import background from '../assets/images/default_background.png';
import notice from '../assets/images/MainPage_img/notice.png';

function MainPage() {
  return (
    <div className='MainPage-wrap'>
      <img
        id='Main_background'
        src={background}
        alt='Main_background'
      />

      <header>
        <img
          id='notice'
          src={notice}
          alt='notice'
        />

        <Header_Logo />
        <Sign />
      </header>
    </div>
  );
}

export default MainPage;