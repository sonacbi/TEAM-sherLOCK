import React from 'react';

import Header_Logo from '../components/Header_Logo/Header_Logo';
import Sign from '../components/Sign/Sign_outside/Sign_outside';
import '../styles/MainPage.css';

import background from '../assets/images/default_background.png';
import notice from '../assets/images/MainPage_img/notice.png';
import horror_outline from '../assets/images/MainPage_img/horror_outline.png';
import horror_icon from '../assets/images/MainPage_img/horror_icon.png';
import adventure_outline from '../assets/images/MainPage_img/adventure_outline.png';
import adventure_icon from '../assets/images/MainPage_img/adventure_icon.png';
import crime_outline from '../assets/images/MainPage_img/crime_outline.png';
import crime_icon from '../assets/images/MainPage_img/crime_icon.png';

function MainPage() {
  return (
    <div className='MainPage_wrap'>
      <div className='MainPage_content'>
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

        <div className='theme'>
          {[
            { id: 'horror', label: '호러', outline: horror_outline, icon: horror_icon },
            { id: 'adventure', label: '모험', outline: adventure_outline, icon: adventure_icon },
            { id: 'crime', label: '범죄', outline: crime_outline, icon: crime_icon }
          ].map(({ id, label, outline, icon }) => (
            <article key={id} id={id}>
              <img className={`${id}_outline`} src={outline} alt={`${id}_outline`} />
              <div className={`${id}_icon`}>
                <img className='theme_icon' src={icon} alt={`${id}_icon`} />
                <p>{label}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MainPage;