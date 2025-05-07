import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

import './GameInfo.css';

import horror_GameInfo_background from '../../assets/images/GameInfo/horror_GameInfo_background.png';
import horror_GameInfo_room from '../../assets/images/ThemePage_img/horror/horror_room.png';
import adventure_GameInfo_background from '../../assets/images/GameInfo/adventure_GameInfo_background.png';
import crime_GameInfo_background from '../../assets/images/GameInfo/crime_GameInfo_background.png';

function GameInfo({ setShowGameInfo }) {
  // URL 파라미터에서 theme 값 가져오기
  const { theme } = useParams();
  const [isExiting, setIsExiting] = useState(false);

  // 테마별 이미지 매핑
  const GameInfo_backgroundMap = {
      horror: horror_GameInfo_background,
      adventure: adventure_GameInfo_background,
      crime: crime_GameInfo_background
  };
  const GameInfo_roomMap = {
      horror: horror_GameInfo_room,
  };

  // 테마에 맞는 이미지 가져오기
  const GameInfo_backgroundImage = GameInfo_backgroundMap[theme] || horror_GameInfo_background;
  const GameInfo_roomImage = GameInfo_roomMap[theme] || horror_GameInfo_room;

  // theme 없거나 배경 이미지 없으면 렌더링 안함
  if (!theme || !GameInfo_backgroundImage) return null;

  // EXIT 클릭 시 애니메이션 후 모달 닫기
  const handleExitClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowGameInfo(false); // 부모 컴포넌트의 상태를 false로 변경하여 모달을 닫음
    }, 600); // 애니메이션 종료 시간과 맞추기
  };

  return (
    <div className={`GameInfo_wrap ${isExiting ? 'fadeOut' : ''}`}>
      <img id='GameInfo_background' src={GameInfo_backgroundImage} alt='GameInfo_background' />

      <div className={`GameInfo_door ${theme}`}>
        <div className='GameInfo_room'>
          <img id='GameInfo_room_img' src={GameInfo_roomImage} alt='GameInfo_room_img' />
          <p>401</p>
          <h5 onClick={handleExitClick}>EXIT</h5>
        </div>

        <div className='GameInfo_content'>
          
        </div>
      </div>
    </div>
  );
}

export default GameInfo;