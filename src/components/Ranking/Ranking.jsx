// Ranking.jsx

import React from 'react';
import { useEffect, useRef, useLayoutEffect, useState, useMemo } from "react";
import { useParams } from 'react-router-dom';

import { motion, AnimatePresence, useAnimation } from 'framer-motion'; // 복잡한 애니메이션 추가용 코드

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
  const [isAnimating, setIsAnimating] = useState(false); // 애니메이션 진행 중 상태
  const [step, setStep] = useState('idle');

  // 트로피 클릭 핸들러 (애니메이션 토글)
  const handleClickRank = () => {
    if (isAnimating || step !== 'idle') return;  // 이미 애니메이션 중이면 리턴
  
    setIsAnimating(true);  // 애니메이션 시작
    setStep('collapsingTop10');  // 축소 애니메이션 시작
  };
  
  // 애니메이션 상태 변화 처리
  useEffect(() => {
    if (step === 'collapsingTop10') {
      setTimeout(() => {
        setStep('shrinkTop10');  // 축소 상태로 변경
      }, 1000);
    } else if (step === 'shrinkTop10') {
      setTimeout(() => {
        setShowTop10(false);  // Top10 숨기기
        setStep('idle');  // 상태 초기화
        setIsAnimating(false);  // 애니메이션 종료
      }, 4000); // 축소 애니메이션 후, Top10 숨김
    }
  }, [step]);

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
  const fullData = useMemo(() => {
    const result = [];
    for (let i = 0; i < 10; i++) {
      if (sortedData[i]) {
        result.push(sortedData[i]);
      } else {
        result.push({ id: `placeholder-${i}`, name: '-', score: '-' });
      }
    }
    return result;
  }, [sortedData]);
  

  // 1~100위 화면을 위한 데이터 (있는 사람만 표시)
  const fullData100 = sortedData; // 이미 내림차순으로 정렬되어 있으므로 그대로 사용


  function RankingComponent({ showTop10, fullData, fullData100, handleClickRank, theme }) {

    // ⭐ 애니메이션 시작 전에 먼저 fullpage 스크롤 막기
    // useEffect(() => {
    //   if (!showTop10 && window.fullpage_api) {
    //     window.fullpage_api.setAllowScrolling(false);
    //   }
    // }, [showTop10]);

    
    // 풀페이지 스크롤 락
    const handleRankingEvents = () => {

      const rankerElement100 = document.querySelector('#ranker_1_100');
      const rankerElement10 = document.querySelector('#ranker_1_10');
      const rankerParentElement = document.querySelector('.rank-scroll');

      console.log('🎯 onAnimationComplete');
      console.log('rankerElement100:', rankerElement100);
      console.log('rankerElement10:', rankerElement10);
      console.log('rankerParentElement:', rankerParentElement);
      
      const isVisible = (elem) => {
        if (!elem) return false;
        const rect = elem.getBoundingClientRect();
        return rect.height > 0 && rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
      };
    
      // 둘 다 없거나 화면에 보이지 않으면 스크롤 허용
      if ((!rankerElement100 && !rankerElement10) || 
          (!isVisible(rankerElement100) && !isVisible(rankerElement10))) {
        window.fullpage_api.setAllowScrolling(true);
        return;
      }
  
      // 마우스 이벤트 바인딩 (하나라도 있는 경우)
      const activeElement = rankerElement100 || rankerElement10 || rankerParentElement;
      if (activeElement && window.fullpage_api) {
        activeElement.addEventListener('mouseenter', () => {
          console.log('🟡 mouseover triggered');
          window.fullpage_api.setAllowScrolling(false);
        });
        activeElement.addEventListener('mouseleave', () => {
          console.log('🟢 mouseout triggered');
          window.fullpage_api.setAllowScrolling(true);
        });
        activeElement.addEventListener('wheel', (e) => {
          e.preventDefault();
          rankerParentElement.scrollTop += e.deltaY;
        }, { passive: false });
      }
    };

    const TrophyDiv = ({ step }) => {
      const divRef = useRef(null);
      const [width, setWidth] = useState('100%');
      const [isWidthCalculated, setIsWidthCalculated] = useState(false);

      // step이 변경될 때마다 width를 저장하고 애니메이션이 완료될 때까지 변경하지 않음
      useLayoutEffect(() => {
        if (divRef.current && step === 'collapsingTop10' && !isWidthCalculated) {
          const rect = divRef.current.getBoundingClientRect();
          setWidth(rect.width);
          setIsWidthCalculated(true); // width가 한 번만 계산되도록 설정
          console.log('저장된 이전 width :', rect.width); // 콘솔로 확인
        }
      }, [step, isWidthCalculated]);

      // 애니메이션이 완료된 후 width가 변하지 않도록 처리
      useEffect(() => {
        if (step === 'idle') {
          setIsWidthCalculated(false); // idle 상태에서 width를 다시 계산할 수 있게 설정
        }
      }, [step]);
    
      return (
        <motion.div
          className='fillColor'
          ref={divRef}
          initial={false}
          animate={{
            width: step === 'collapsingTop10' || step === 'shrinkTop10' ? '100%' : width,
          }}
          transition={{
            duration: 3,
            ease: 'easeInOut',
          }}
          style={{
            borderRadius: '5px',
            position: 'absolute',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <img className="trophy" src={Trophy} alt="Trophy" />
        </motion.div>
      );
    };
    


    return (
      <div className={`ranking_container ${theme}`} style = {{position:'relative'}}>
        {/* 공통 타이틀 등 여기에 삽입 */}
  
        {/* 1~10위 */}
        <AnimatePresence mode="wait">
          {showTop10 && (
            <motion.div
              key={step}
              id="ranker_1_10"
              layout
              className={`ranker_grid ${step === 'shrinkTop10' ? 'shrunk' : ''}`}
              // animate={step === 'shrinkTop10' ? { gridTemplateRows: 'repeat(5, 0px), 48px', transition: { duration: 5, ease: 'easeInOut' } } : {}}
              onAnimationComplete={handleRankingEvents}
              style={{ position: 'relative' }} // 부모의 relative 설정을 다시 확인
            >
              {fullData.slice(0, 10).map((user, index) => (
                <motion.li
                  key={`user-${user.id}`}
                  layout
                  animate={
                    step === 'collapsingTop10' || step === 'shrinkTop10'
                      ? 
                      index === 9 // li10
                        ? { width: 0, opacity: 0, position: 'absolute', padding: 0, margin :0 }
                        : { height: 0, opacity: 0 , padding: 0, margin :0 }
                      : {}
                  }
                  transition={{ duration: 3 }}
                  className={`li${index + 1} fillColor`}
                  style={{
                    overflow: 'hidden',
                    gridColumn: index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '2' : index % 2 === 1 ? '1' : '2',
                    gridRowStart: index === 0 ? 1 : index === 1 ? 1 : index === 2 ? 2 : undefined,
                    gridRowEnd: index === 0 ? 3 : index === 1 ? 2 : index === 2 ? 3 : undefined,
                    position: 'relative', // 위치는 relative로 유지
                  }}
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
                    <img id="ex_user_profile" src={ex_user_profile} alt="ex_user_profile" />
                    <span className="rank_name">{user.name}</span>
                  </div>
                  <div className="rank_score">{user.score}</div>

                  {/* 월계관 */}
                  {index === 0 && <img className="Raurel" src={Raurel} alt="Raurel" />}
                </motion.li>
              ))}

              {/* toggle 버튼 */}
              <motion.div
                layoutId="trophy" // layoutId는 여전히 toggle을 위한 요소에서만 사용
                layout
                transition={{ layout: { duration: 0 } }}
                className="toggle_trophy"
                onClick={handleClickRank}
                style={{
                  gridRowStart: step === 'shrinkTop10' ? 6 : step === 'collapsingTop10' ? 6 : 6,
                  gridRowEnd: step === 'shrinkTop10' ? 7 : step === 'collapsingTop10' ? 7 : 7,
                  gridColumn:
                    step === 'shrinkTop10' ? '1 / span 2' : step === 'collapsingTop10' ? '1 / span 2' : '2 / span 1',
                  position: step === 'shrinkTop10' || step === 'collapsingTop10' ? 'absolute' : 'relative',
                  top: step === 'shrinkTop10' ? '0' : 'auto',  // shrinkTop10일 때 top: 0으로 이동
                }}
              >
                <TrophyDiv step={step} />
              </motion.div>
            </motion.div>
          )}

          {/* 1~100위 */}
          {!showTop10 && (
            <motion.ul
              key={step} 
              id="ranker_1_100"
              className="ranker_flex"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.5 }}
              onAnimationComplete={handleRankingEvents}
            >
              {/* table header */}
              <li className="table_header fillColor">
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
                      className={`li${index + 4} fillColor`}
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
                className="toggle_trophy fillColor"
                onClick={handleClickRank}
              >
                <div>
                <img className="trophy" src={Trophy} alt="Trophy" />
                </div>
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
