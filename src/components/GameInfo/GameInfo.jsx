import React from 'react';
import { useParams } from 'react-router-dom';

import './GameInfo.css';

import horror_GameInfo_background from '../../assets/images/GameInfo/horror_GameInfo_background.png';
import horror_GameInfo_room from '../../assets/images/ThemePage_img/horror/horror_room.png';

function GameInfo() {
  // URL 파라미터에서 theme 값 가져오기
  const { theme } = useParams();

  // 테마별 이미지 매핑
  const GameInfo_backgroundMap = {
      horror: horror_GameInfo_background,
  };
  const GameInfo_roomMap = {
      horror: horror_GameInfo_room,
  };

  // 테마에 맞는 이미지 가져오기
  const GameInfo_backgroundImage = GameInfo_backgroundMap[theme] || horror_GameInfo_background;
  const GameInfo_roomImage = GameInfo_roomMap[theme] || horror_GameInfo_room;

  // theme 없거나 배경 이미지 없으면 렌더링 안함
  if (!theme || !GameInfo_backgroundImage) return null;

  return (
    <div className='GameInfo_wrap'>
      <img id='GameInfo_background' src={GameInfo_backgroundImage} alt='GameInfo_background' />

      <div className='GameInfo_door'>
        <div className='GameInfo_room'>
          <img id='GameInfo_room_img' src={GameInfo_roomImage} alt='GameInfo_room_img' />

          <p>401</p>
        </div>

        <div className='GameInfo_content'>

        </div>
      </div>
    </div>
  );
}

export default GameInfo;