// Ranking.jsx

import React from 'react';
import { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';

import './Ranking.css';

import Trophy from '../../assets/images/Ranking_img/trophy.png';
import Crown from'../../assets/images/Ranking_img/crown.png';
import Raurel from'../../assets/images/Ranking_img/raurel.png';
import ex_user_profile from '../../assets/images/Profile/ex_user_profile.png'; // 더미데이터

function Ranking() {
  // 주소값에서 theme 파라미터 가져오기
  const { theme } = useParams();

  // 랭킹 상태
  const [showTop10, setShowTop10] = useState(true); // 처음엔 1~10위 보여주기

  // 트로피 클릭 핸들러 (true <-> false 토글)
  const handleClickRank = () => {setShowTop10((prev) => !prev);};

  // 닉네임 목록
  const namePrefixes = ['Gamer', 'Player', 'User', 'Hero', 'Champion', 'Master', 'King', 'Queen', 'Star', 'Boss'];
  const nameSuffixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'X', 'Z', 'Alpha', 'Beta'];

  // 100명의 더미 데이터 생성
  const dummyData = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    name: `${namePrefixes[index % namePrefixes.length]}_${nameSuffixes[index % nameSuffixes.length]}`, // 랜덤하게 닉네임 생성
    score: Math.floor(Math.random() * 200) + 50,  // 50~249 사이의 랜덤 점수
  }));

  // 내림차순으로 자동정렬
  const sortedData = [...dummyData].sort((a, b) => b.score - a.score);

  // 항상 10개를 만들기 위해
  const fullData = [];
  for (let i = 0; i < 10; i++) {
    if (sortedData[i]) {
      fullData.push(sortedData[i]);
    } else {
      fullData.push({ id: i + 1, name: '-', score: '-' }); // 빈 칸 채우기
    }
  }

  // 1~100위 화면을 위한 데이터 (있는 사람만 표시)
  const fullData100 = sortedData; // 이미 내림차순으로 정렬되어 있으므로 그대로 사용

  // 랭킹 스크롤 이벤트 제어
  useEffect(() => {
    const rankerParentElement = document.querySelector('#ranker_1_100');
    const rankScrollElement = document.querySelector('.rank-scroll');

    const handleMouseEnter = () => {
        if (window.fullpage_api) {
            window.fullpage_api.setAllowScrolling(false);
        }
    };

    const handleMouseLeave = () => {
        if (window.fullpage_api) {
            window.fullpage_api.setAllowScrolling(true);
        }
    };

    const handleWheel = (e) => {
        if (rankScrollElement) {
            e.preventDefault(); // 기본 스크롤 방지
            rankScrollElement.scrollTop += e.deltaY; // 강제로 rank-scroll에 스크롤 보내기
        }
    };

    if (rankerParentElement) {
        rankerParentElement.addEventListener('mouseenter', handleMouseEnter);
        rankerParentElement.addEventListener('mouseleave', handleMouseLeave);
        rankerParentElement.addEventListener('wheel', handleWheel, { passive: false }); // 휠 이벤트 추가
    }

    return () => {
        if (rankerParentElement) {
            rankerParentElement.removeEventListener('mouseenter', handleMouseEnter);
            rankerParentElement.removeEventListener('mouseleave', handleMouseLeave);
            rankerParentElement.removeEventListener('wheel', handleWheel);
        }
    };
}, []);
    

  return (
    <div className={`ranking_container ${theme}`}>
      <p></p>
    {/* 1~10위 */}
    <ul id="ranker_1_10" style={{ display: showTop10 ? 'grid' : 'none' }}>
      {fullData.map((user, index) => {
        if (index < 10) { // 0~9 인덱스만
          if (index === 0) {
            return (
              <li key={user.id} className={`li${index + 1}`}>
                <img className="Crown" src={Crown} alt="Crown" />
                <div className="rank_profile">              
                  <img id='ex_user_profile' src={ex_user_profile} alt='ex_user_profile' />
                  <span className="rank_name">{user.name}</span>
                </div>
                <span className="rank_score">{user.score}</span>
                <img className="Raurel" src={Raurel} alt="Raurel" />
              </li>
            );
          } else if (index === 1 || index === 2) {
            return (
              <li key={user.id} className={`li${index + 1}`}>
                <div className="rank_header">
                  <img className="Crown_small" src={Crown} alt="Crown" />
                </div>
                <div className="rank_profile">              
                  <img id='ex_user_profile' src={ex_user_profile} alt='ex_user_profile' />
                  <span className="rank_name">{user.name}</span>
                </div>
                <span className="rank_score">{user.score}</span>
              </li>
            );
          } else {
            return (
              <li key={user.id} className={`li${index + 1}`}>
                <div className="rank_header">
                  <span className="rank_index">{index + 1}</span>
                </div>
                <div className="rank_profile">              
                  <img id='ex_user_profile' src={ex_user_profile} alt='ex_user_profile' />
                  <span className="rank_name">{user.name}</span>
                </div>
                <span className="rank_score">{user.score}</span>
              </li>
            );
          }
        } else {
          return null; // 11등부터는 안 보여줘
        }
      })}
      {/* 트로피 버튼 */}
      <li className="toggle_trophy" onClick={handleClickRank}>
        <img className="trophy" src={Trophy} alt="Trophy" />
      </li>
    </ul>
    {/* 1~100위 (있을 경우만 표시) */}
    <ul id="ranker_1_100" style={{ display: !showTop10 ? 'flex' : 'none' }}>
    {/* 테이블 헤더 */}
    <li className="table_header">
      <div className="column_header">등수</div>
      <div className="column_nickname">닉네임</div>
      <div className="column_score">점수</div>
    </li>

    {/* 고정 1~3위 */}
    {fullData100.slice(0, 3).map((user, index) => (
      <li key={user.id} className={`li${index + 1} rank_sticky`}>
        <div className="rank_header">
          <span className="rank_index">{index + 1}</span>
        </div>
        <div className="rank_profile">
          <img id="ex_user_profile" src={ex_user_profile} alt="ex_user_profile" />
          <span className="rank_name">{user.name}</span>
        </div>
        <span className="rank_score">{user.score}</span>
      </li>
    ))}

    {/* 4~100위 (스크롤 영역) */}
    <div className="rank-scroll">
      <ul>
        {fullData100.slice(3, 100).map((user, index) => (
          <li key={user.id} className={`li${index + 4}`}>
            <div className="rank_header">
              <span className="rank_index">{index + 4}</span>
            </div>
            <div className="rank_profile">
              <img id="ex_user_profile" src={ex_user_profile} alt="ex_user_profile" />
              <span className="rank_name">{user.name}</span>
            </div>
            <span className="rank_score">{user.score}</span>
          </li>
        ))}
      </ul>
    </div>
    {/* 트로피 버튼 */}
    <li className="toggle_trophy" onClick={handleClickRank}>
      <div>
        <img className="trophy" src={Trophy} alt="Trophy" />
      </div>
      
    </li>
  </ul>
    

  </div>
  );  
}

export default Ranking;
