import { useEffect, useRef } from "react";

import Header_Logo from '../components/Header_Logo/Header_Logo';
import Sign from '../components/Sign/Sign_outside/Sign_outside';
import Footer from '../components/Footer/Footer';
import Sign_in from '../components/Sign/Sign_inside/Sign_In/Sign_in';
import '../styles/MainPage.css';

import background from '../assets/images/default_background.png';
import notice from '../assets/images/MainPage_img/notice.png';
import horror_outline from '../assets/images/MainPage_img/horror_outline.png';
import horror_icon from '../assets/images/MainPage_img/horror_icon.png';
import adventure_outline from '../assets/images/MainPage_img/adventure_outline.png';
import adventure_icon from '../assets/images/MainPage_img/adventure_icon.png';
import crime_outline from '../assets/images/MainPage_img/crime_outline.png';
import crime_icon from '../assets/images/MainPage_img/crime_icon.png';

const themes = [
  { id: "horror", label: "호러", outline: horror_outline, icon: horror_icon },
  { id: "adventure", label: "모험", outline: adventure_outline, icon: adventure_icon },
  { id: "crime", label: "범죄", outline: crime_outline, icon: crime_icon }
];

function MainPage() {
  const articlesRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("show");
            }, index * 200);
          }
        });
      },
      { threshold: 0.3 }
    );

    articlesRef.current.forEach((article) => {
      if (article) observer.observe(article);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className='MainPage_wrap'>
      <div className='MainPage_content'>
        <img id='Main_background' src={background} alt='Main_background' />

        <header>
          <img id='notice' src={notice} alt='notice' />
          <Header_Logo />
          <Sign />
        </header>

        <div className="theme">
          {themes.map(({ id, label, outline, icon }, index) => (
            <article
              key={id}
              id={id}
              ref={(el) => {
                if (el) articlesRef.current[index] = el;
              }}
            >
              <img className={`${id}_outline`} src={outline} alt={`${id}_outline`} />
              <div className={`${id}_icon`}>
                <img className="theme_icon" src={icon} alt={`${id}_icon`} />
                <p>{label}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <Footer />
      {/* <Sign_in /> */}
    </div>
  );
}

export default MainPage;