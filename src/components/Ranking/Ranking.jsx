// Ranking.jsx

import React from 'react';
import { useEffect, useRef, useLayoutEffect, useState, useMemo } from "react";
import { useParams } from 'react-router-dom';

import { motion, AnimatePresence, useAnimation } from 'framer-motion'; // 복잡한 애니메이션 추가용 코드

import './Ranking.css';
import HoverName from './hoverName.jsx';

import Trophy from '../../assets/images/Ranking_img/trophy.png';
import rank_user_profile from '../../assets/images/Profile/ex_user_profile.png'; // 더미데이터



function Ranking() {
  // 주소값에서 theme 파라미터 가져오기
  const { theme } = useParams();

  // 랭킹 보여줄 범위 상태
  const [showTop10, setShowTop10] = useState(true); // 기본값: 1~10위 보여줌
  const [isAnimating, setIsAnimating] = useState(false); // 애니메이션 진행 중 여부
  const [step, setStep] = useState('idle');  // 애니메이션 단계 상태

  // 트로피 아이콘 너비 상태
  const [trophyWidth, setTrophyWidth] = useState(null);
  const trophyRef = useRef(); // 트로피 DOM 참조

  // 1~10위 접히는 애니메이션 속도 상수
  const [trans_10] = useState(1.4);

  // 애니메이션 타이머 ID 저장용 ref
  const timeoutRef = useRef(null);

  // 애니메이션 중복 실행 방지용 ref
  const hasRunRef = useRef(false);

  // 트로피 클릭 시 애니메이션 토글 처리 함수
  const handleClickRank = () => {
    // 이미 애니메이션 중이거나 상태가 idle이 아니면 동작 안함
    if (isAnimating || step !== 'idle') return;
    setIsAnimating(true); // 애니메이션 시작 상태로 변경

    // 트로피 현재 너비를 구해 저장
    if (trophyRef.current) {
      const width = trophyRef.current.getBoundingClientRect().width;
      console.log("확인");
      setTrophyWidth(width);
    }

    // showTop10이 true면 'collapsingTop10' 단계로, false면 'shrink' 단계로 변경
    if (showTop10) { setStep('collapsingTop10'); } else { setStep('shrink'); }
  }

  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth <= 700);
    };

    checkScreenSize(); // 처음 실행
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // step 상태 변화에 따른 애니메이션 단계 처리 및 타이머 관리
  useEffect(() => {
    if (hasRunRef.current) return; // 이미 실행 중이면 무시
    hasRunRef.current = true;

    if (timeoutRef.current) { clearTimeout(timeoutRef.current); }

    const run = () => {
      console.log("Current step:", step);

      if (step === 'collapsingTop10') {
        // 1. 1~10위 영역 접기 애니메이션 후 showTop10 숨김, 다음 단계로 진행
        timeoutRef.current = setTimeout(() => {
          setShowTop10(false);
          requestAnimationFrame(() => setStep('expandTrans'));
        }, 1500);
      }
      else if (step === 'expandTrans') {
        // 2. 영역 확장 애니메이션 후 idle 상태 복귀, 애니메이션 종료 처리
        timeoutRef.current = setTimeout(() => {
          setStep('idle');
          setIsAnimating(false);
        }, 700);
      }
      else if (step === 'shrink') {
        // 3. 축소 애니메이션 후 1~10위 영역 다시 보이도록 설정, 다음 단계 popup으로 변경
        timeoutRef.current = setTimeout(() => {
          setShowTop10(true);
          setStep((prev) => prev === 'shrink' ? 'popup' : prev);
        }, 1200);
      }
      else if (step === 'popup') {
        // 4. 팝업 애니메이션 후 idle 상태 및 애니메이션 종료 처리
        timeoutRef.current = setTimeout(() => {
          setStep('idle');
          setIsAnimating(false);
        }, 1000);
      }
    };

    run();

    // 클린업 함수 - 컴포넌트 언마운트 또는 step 변경 시 타이머 제거 및 중복 실행 상태 초기화
    return () => { hasRunRef.current = false; if (timeoutRef.current) clearTimeout(timeoutRef.current); };

  }, [step]);


  // 더미 닉네임 접두사, 접미사 배열
  const namePrefixes = ['Gamerr', 'Player', 'User', 'Hero', 'Champion', 'Master', 'King', 'Queen', 'Star', 'Boss'];
  const nameSuffixes = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', 'X', 'Z', 'Alpha', 'Beta'];

  // (length)명의 더미 랭킹 데이터 생성 (랜덤 점수 포함)
  const dummyData = Array.from({ length: 50 }, (_, index) => ({
    id: index + 1,
    name: `${namePrefixes[index % namePrefixes.length]}_${nameSuffixes[index % nameSuffixes.length]}`, // 랜덤하게 닉네임 생성
    score: Math.floor(Math.random() * 200) + 50,  // 50~249 사이의 랜덤 점수
  }));

  // 내림차순으로 자동정렬
  const sortedData = [...dummyData].sort((a, b) => b.score - a.score);

  // 항상 10개 항목이 있도록 채워주는 배열 (10위 미만은 placeholder)
  const fullData = useMemo(() => {
    const result = [];
    for (let i = 0; i < 10; i++) {
      if (sortedData[i]) { result.push(sortedData[i]);
      } else { result.push({ id: `placeholder-${i}`, name: '-', score: '-' }); }
    }
    return result;
  }, [sortedData]);
  
  // 1~100위 전체 화면용 데이터 (sortedData 재활용)
    const fullData100 = sortedData;

    const animatedHeight = step === 'expandTrans' || step === 'idle'
      ? (isSmallScreen ? 280 : 330)
      : step === 'shrink'
      ? (isSmallScreen ? 40 : 40)
      : 0;

    const initialHeight = 
      step === 'collapsingTop10' || step === 'expandTrans'
        ? 40
        : step === 'shrink'
        ? (isSmallScreen ? 280 : 330)
        : undefined;

const animatedOpacity = step === 'shrink' ? 0 : 1;

  // 실제 화면에 렌더링 되는 컴포넌트
  function RankingComponent({ showTop10, fullData, fullData100, handleClickRank, theme }) {
    
    // fullpage 스크롤 관리: 스크롤 영역에 마우스 진입 시 스크롤 잠금, 나가면 해제
      useEffect(() => {
        const rankerElement100 = document.querySelector('#ranker_1_100');
        const rankerElement10 = document.querySelector('#ranker_1_10');
        const rankerParentElement = document.querySelector('.rank-scroll');

        // 특정 요소가 화면에 보이는지 판단하는 함수
        const isVisible = (elem) => {
          if (!elem) return false;
          const rect = elem.getBoundingClientRect();
          return rect.height > 0 && rect.width > 0 && rect.bottom > 0 && rect.top < window.innerHeight;
        };

        // 둘 다 없거나 둘 다 안 보이면 스크롤 허용 후 종료
        if ((!rankerElement100 && !rankerElement10) ||
            (!isVisible(rankerElement100) && !isVisible(rankerElement10))) {
          window.fullpage_api?.setAllowScrolling(true);
          return;
        }

        // 이벤트 핸들러 바인딩
        const activeElement = rankerElement100 || rankerElement10 || rankerParentElement;

        if (activeElement && window.fullpage_api) {
          // 마우스 진입 시 스크롤 잠금
          const onMouseEnter = () => window.fullpage_api.setAllowScrolling(false);
          // 마우스 이탈 시 스크롤 해제
          const onMouseLeave = () => window.fullpage_api.setAllowScrolling(true);
          // 휠 스크롤 커스텀 처리
          const onWheel = (e) => {
            e.preventDefault();
            rankerParentElement.scrollTop += e.deltaY;
          };

          activeElement.addEventListener('mouseenter', onMouseEnter);
          activeElement.addEventListener('mouseleave', onMouseLeave);
          activeElement.addEventListener('wheel', onWheel, { passive: false });

          // 클린업: 이벤트 제거
          return () => {
            activeElement.removeEventListener('mouseenter', onMouseEnter);
            activeElement.removeEventListener('mouseleave', onMouseLeave);
            activeElement.removeEventListener('wheel', onWheel);
          };
        }
      }, [step]);



  // 디버깅용: step 변경 시 로그 출력
    useEffect(() => {
      console.log(`🪵 step changed: ${step}`);
      console.trace('🔍 step change stack trace');
    }, [step]);


  // 트로피 애니메이션용 div 컴포넌트
    const TrophyDiv = ({ step, prevWidthProp }) => {
      const divRef = useRef(null);
      const [animatedWidth, setAnimatedWidth] = useState(prevWidthProp);

      useEffect(() => {
        if (step === 'collapsingTop10') {
          // 이전 width를 설정 후 다음 프레임에 부모 요소의 너비로 변경 (애니메이션 트리거)
          setAnimatedWidth(`${prevWidthProp}px`);
    
          // 다음 프레임에 새로운 width 적용 → 애니메이션 유도
          requestAnimationFrame(() => {
            const rect =  divRef.current?.parentElement?.getBoundingClientRect(); // 부모요소 크기 참조
            if (rect?.width > 0) { setAnimatedWidth(`${rect.width}px`); }
          });
          
        } else { setAnimatedWidth(`${prevWidthProp}px`); }
      }, [step, prevWidthProp]);
    
  
    
      return (
        <motion.div
          className="fillColor"
          ref={divRef}
          initial={false}
          animate={{ width: animatedWidth }}
          transition={!(step === 'popup')?{
            type : 'spring',
            stiffness: 100,
            damping: 20,
            mass: 1,
            restDelta: 0.001,
            duration: step === 'collapsingTop10' ? 0.8 : 0,
            ease: 'easeInOut',
          }: {}}
          style={{
            borderRadius: '5px',
            position: step === 'popup' ? 'relative' : 'absolute',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            left: step === 'popup' ? 'auto' : step === 'collapsingTop10' ? 'auto' : '50%',
            right: step === 'popup' ? '0%' : step === 'collapsingTop10' ? '0%' : 'auto',
            transform: step === 'popup' ? 'none' : step === 'collapsingTop10' ? 'none' : 'translateX(-50%)',
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
              className={`ranker_grid` }
              initial = {step === 'popup' ? {opacity : 0, y : 5}: {}}
              animate={step === 'collapsingTop10' ? { height: 'auto', gridTemplateRows: 'repeat(6, auto)' } : step === 'popup' ? {opacity : 1, y : 0} : {}}

              transition={step === 'popup' ? {duration : 1.0} : {}}
              style={{ position: 'relative' }} // 부모의 relative 설정을 다시 확인
            >
              {fullData.slice(0, 10).map((user, index) => (
                index === 9 ? (
                  <React.Fragment key={`user-${user.id}`}>
                    <motion.li
                      layout
                      animate={
                        step === 'collapsingTop10'
                          ? { width: 0, opacity: 0, position: 'absolute', padding: 0, margin: 0 }
                          : {}
                      }
                      transition={{ duration: 0 }}
                      className={`li${index + 1} fillColor`}
                      style={{
                        overflow: 'hidden',
                        gridColumn: '1',
                        position: 'relative',
                      }}
                    >
                      {/* 랭킹 숫자 */}
                      <div className="rank_header">
                        <span className="rank_index">{index + 1}</span>
                      </div>

                      {/* 이름 및 점수 */}
                      <div className="rank_profile">
                        <img id="rank_user_profile" src={rank_user_profile} alt="rank_user_profile" />
                        <HoverName name={user.name} index={index} />
                      </div>
                      <div className="rank_score">{user.score}</div>
                    </motion.li>
                  </React.Fragment>
                ) : (
                  <motion.li
                    key={`user-${user.id}`}
                    layout
                    animate={
                      step === 'collapsingTop10'
                        ? { height: 0, opacity: 0, padding: 0, margin: 0 }
                        : {}
                    }
                    transition={{ duration: trans_10,
                      type: 'tween',
                      ease: 'anticipate',
                     }}
                    className={`li${index + 1} fillColor`}
                    style={{
                      overflow: 'hidden',
                      gridColumn: index === 0 ? '1' : index === 1 ? '2' : index === 2 ? '2' : index % 2 === 1 ? '1' : '2',
                      gridRowStart: index === 0 ? 1 : index === 1 ? 1 : index === 2 ? 2 : undefined,
                      gridRowEnd: index === 0 ? 3 : index === 1 ? 2 : index === 2 ? 3 : undefined,
                      position: 'relative',
                    }}
                  >
                    <div className="rank_header">
                        <span className="rank_index">{index + 1}</span>
                      </div>

                    {/* 이름 및 점수 */}
                    <div className="rank_profile">
                      <img id="rank_user_profile" src={rank_user_profile} alt="rank_user_profile" />
                      <HoverName name={user.name} index={index} />
                    </div>
                    <div className="rank_score">{user.score}</div>
                  </motion.li>
                )
              ))}

              {/* toggle 버튼 */}
              <motion.div
                layoutId="trophy" // layoutId는 여전히 toggle을 위한 요소에서만 사용
                layout
                initial={step === 'popup' ? {display : 'grid'} : {}}
                transition={{ layout: {type : 'tween', duration: trans_10 } }}
                className="toggle_trophy"
                ref={trophyRef} // ref를 제대로 설정
                onClick={handleClickRank}
                style={{
                  gridRowStart: 6,
                  gridRowEnd: 7,
                  gridColumn:
                    step === 'collapsingTop10' ? '1 / span 2' : '2 / span 1',
                  position: (step === 'collapsingTop10')||(step === 'popup') ? 'absolute' : 'relative',
                  top: 'auto',  
                  height: isSmallScreen ? '40px' : '48px', // 조건부 height
                }}
              >
                <TrophyDiv  step={step} prevWidthProp={trophyWidth} />
              </motion.div>
            </motion.div>
          )}

          {/* 1~100위 */}
          {!showTop10 && (
            <motion.ul
              id="ranker_1_100"
              className="ranker_flex"
              initial={
                initialHeight !== undefined
                  ? { height: initialHeight, ...(step === 'shrink' && { opacity: 1 }) }
                  : false
              }
              animate={{
                height: animatedHeight,
                opacity: animatedOpacity
              }}
              exit={false}
              transition={step == 'shrink' ? { 
                type: 'tween',
                duration: 0.8, // 원하는 시간
                ease: 'easeInOut'
              } : { 
                type: 'tween',
                duration: 0.7, // 원하는 시간
                ease: 'easeInOut'
              }}
              // onAnimationComplete={handleRankingEvents}
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
                  initial={step === 'collapsingTop10' ? { height: 0 } : {}}
                  animate={step === 'expandTrans' ? { height: 'auto' } : {}}
                  className={`li${index + 1} rank_sticky`}
                >
                  <div className="rank_header">
                    <span className="rank_index">{index + 1}</span>
                  </div>
                  <div className="rank_profile">              
                    <img id='rank_user_profile' src={rank_user_profile} alt='rank_user_profile' />
                    <span className="rank_name">{user.name}</span>
                  </div>
                  <div className="rank_score">{user.score}</div>
                </motion.li>
              ))}
  
              {/* scroll 영역 */}
              <motion.div 
                className="rank-scroll"
                initial={step === 'collapsingTop10' ? { height: 0 } : {}}
                animate={step === 'expandTrans' ? { height: 'auto' } : {}}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              >
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
                        <img id='rank_user_profile' src={rank_user_profile} alt='rank_user_profile' />
                        <span className="rank_name">{user.name}</span>
                      </div>
                      <div className="rank_score">{user.score}</div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
  
              {/* 토글 버튼 (겉보기엔 똑같은 위치, 내부 컴포넌트만 바뀜) */}
              <motion.li
                layout
                className="toggle_trophy fillColor"
                onClick={handleClickRank}
                style ={ {height : '48px', zIndex : '10'
                  }}
                transition={{ duration: 0.8 }}
                
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
  <>
    <div className='rank_top_margin'> </div>
    <RankingComponent
      showTop10={showTop10}
      fullData={fullData}
      fullData100={fullData100}
      handleClickRank={handleClickRank}
      theme={theme}
    />
  </>
  );
   
}

export default Ranking;
