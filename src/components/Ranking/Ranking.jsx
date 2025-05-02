// Ranking.jsx

import React from 'react';
import { useEffect, useRef, useState } from "react";
import { useParams } from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion'; // 복잡한 애니메이션 추가용 코드

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

  // 풀페이지 스크롤 제어용 (비활성화 영역 체크)
  const rankerParentRef = useRef(null);
  const rankScrollRef = useRef(null);

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


  function RankingComponent({ showTop10, fullData, fullData100, handleClickRank, theme }) {

    // ⭐ 애니메이션 시작 전에 먼저 fullpage 스크롤 막기
    useEffect(() => {
      if (!showTop10 && window.fullpage_api) {
        window.fullpage_api.setAllowScrolling(false);
      }
    }, [showTop10]);

    
    // 풀페이지 스크롤 락
    const handleRankingEvents = () => {
      const rankerParentElement = document.querySelector('#ranker_1_100');
      const rankScrollElement = document.querySelector('.rank-scroll');
      console.log('🎯 onAnimationComplete');
      console.log('rankerParentElement:', rankerParentElement);
      console.log('rankScrollElement:', rankScrollElement);
  
      if (rankerParentElement && rankScrollElement && window.fullpage_api) {
        rankerParentElement.addEventListener('mouseenter', () => {
          window.fullpage_api.setAllowScrolling(false);
        });
        rankerParentElement.addEventListener('mouseleave', () => {
          window.fullpage_api.setAllowScrolling(true);
        });
        rankerParentElement.addEventListener('wheel', (e) => {
          e.preventDefault();
          rankScrollElement.scrollTop += e.deltaY;
        }, { passive: false });
      }
    };


    return (
      <div className={`ranking_container ${theme}`}>
        {/* 공통 타이틀 등 여기에 삽입 */}
  
        {/* 1~10위 */}
        <AnimatePresence mode="wait">
          {showTop10 && (
            <motion.ul
              key="top10"
              id="ranker_1_10"
              className="ranker_grid"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, type: "spring", stiffness: 80 }}
              onAnimationComplete={handleRankingEvents}
            >
              {fullData.slice(0, 10).map((user, index) => (
                <motion.li
                  key={user.id}
                  layout
                  transition={{ duration: 0.4 }}
                  className={`li${index + 1}`}
                >
                  {/* 왕관 또는 숫자 */}
                  {index === 0 ? (
                    <img className="Crown" src={Crown} alt="Crown" />
                  ) : index === 1 || index === 2 ? (
                    <div className="rank_header">
                      <img className="Crown_small" src={Crown} alt="Crown" />
                    </div>
                  ) : (
                    <div className="rank_header">
                      <span className="rank_index">{index + 1}</span>
                    </div>
                  )}

                  {/* 이름 및 점수 */}
                  <div className="rank_profile">              
                    <img id='ex_user_profile' src={ex_user_profile} alt='ex_user_profile' />
                    <span className="rank_name">{user.name}</span>
                  </div>
                  <div className="rank_score">{user.score}</div>

                  {/* 월계관 */}
                  {index === 0 && <img className="Raurel" src={Raurel} alt="Raurel" />}
                </motion.li>
              ))}

  
              {/* toggle 버튼 */}
              <motion.li
                className="toggle_trophy"
                layout
                onClick={handleClickRank}
                transition={{ duration: 0.4 }}
              >
                <img className="trophy" src={Trophy} alt="Trophy" />
              </motion.li>
            </motion.ul>
          )}
  
          {/* 1~100위 */}
          {!showTop10 && (
            <motion.ul
              key="top100"
              id="ranker_1_100"
              className="ranker_flex"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              onAnimationComplete={handleRankingEvents}
            >
              {/* table header */}
              <li className="table_header">
                <div className="column_header">등수</div>
                <div className="column_nickname">닉네임</div>
                <div className="column_score">점수</div>
              </li>
  
              {/* sticky 1~3위 */}
              {fullData100.slice(0, 3).map((user, index) => (
                <motion.li
                  layout
                  key={user.id}
                  className={`li${index + 1} rank_sticky`}
                >
                  <div className="rank_header">
                    <span className="rank_index">{index + 1}</span>
                  </div>
                  <div className="rank_profile">              
                    <img id='ex_user_profile' src={ex_user_profile} alt='ex_user_profile' />
                    <span className="rank_name">{user.name}</span>
                  </div>
                  <div className="rank_score">{user.score}</div>
                </motion.li>
              ))}
  
              {/* scroll 영역 */}
              <div className="rank-scroll">
                <ul>
                  {fullData100.slice(3, 100).map((user, index) => (
                    <motion.li
                      layout
                      key={user.id}
                      className={`li${index + 4}`}
                    >
                      <div className="rank_header">
                        <span className="rank_index">{index + 4}</span>
                      </div>
                      <div className="rank_profile">              
                        <img id='ex_user_profile' src={ex_user_profile} alt='ex_user_profile' />
                        <span className="rank_name">{user.name}</span>
                      </div>
                      <div className="rank_score">{user.score}</div>
                    </motion.li>
                  ))}
                </ul>
              </div>
  
              {/* 토글 버튼 (겉보기엔 똑같은 위치, 내부 컴포넌트만 바뀜) */}
              <motion.li
                layout
                className="toggle_trophy"
                onClick={handleClickRank}
              >
                <img className="trophy" src={Trophy} alt="Trophy" />
              </motion.li>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <RankingComponent
      showTop10={showTop10}
      fullData={fullData}
      fullData100={fullData100}
      handleClickRank={handleClickRank}
      theme={theme}
    />
  );
   
}

export default Ranking;
