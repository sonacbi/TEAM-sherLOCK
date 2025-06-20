import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import './GameInfo.css';

import horror_GameInfo_background from '../../assets/images/GameInfo/horror_GameInfo_background.png';
import horror_GameInfo_room from '../../assets/images/ThemePage_img/horror/horror_room.png';
import horror_GameInfo_rating_star from '../../assets/images/ThemePage_img/horror/horror_rating_star.png';
import horror_GameInfo_difficulty from '../../assets/images/ThemePage_img/horror/horror_difficulty_img.png';
import adventure_GameInfo_background from '../../assets/images/GameInfo/adventure_GameInfo_background.png';
import adventure_GameInfo_rating_star from '../../assets/images/ThemePage_img/adventure/adventure_rating_star.png';
import adventure_GameInfo_difficulty from '../../assets/images/ThemePage_img/adventure/adventure_difficulty_img.png';
import crime_GameInfo_background from '../../assets/images/GameInfo/crime_GameInfo_background.png';
import crime_GameInfo_rating_star from '../../assets/images/ThemePage_img/crime/crime_rating_star.png';
import crime_GameInfo_difficulty from '../../assets/images/ThemePage_img/crime/crime_difficulty_img.png';
import thumbnail_img from '../../assets/images/ThemePage_img/horror/horror_door1_img.png';
import player_icon from '../../assets/images/GameInfo/player_icon.png';
import gallery1_img from '../../assets/images/GameInfo/gallery1_img.png';
import gallery2_img from '../../assets/images/GameInfo/gallery2_img.png';
import gallery3_img from '../../assets/images/GameInfo/gallery3_img.png';

function GameInfo({ gameInfo, roomNumber, setShowGameInfo, setShowLoading, setLoadingMessage }) {
  // URL 파라미터에서 theme 값 가져오기
  const { theme } = useParams();

  const navigate = useNavigate();

  const [isExiting, setIsExiting] = useState(false);
  const GameInfo_difficulty = 3;
  const [activeTab, setActiveTab] = useState('introduction');
  const [isPlayClicked, setIsPlayClicked] = useState(false);

  // 테마별 이미지 매핑
  const GameInfo_backgroundMap = {
    horror: horror_GameInfo_background,
    adventure: adventure_GameInfo_background,
    crime: crime_GameInfo_background
  };
  const GameInfo_roomMap = {
    horror: horror_GameInfo_room,
  };
  const GameInfo_starMap = {
    horror: horror_GameInfo_rating_star,
    adventure: adventure_GameInfo_rating_star,
    crime: crime_GameInfo_rating_star
  };
  const GameInfo_difficultyMap = {
    horror: horror_GameInfo_difficulty,
    adventure: adventure_GameInfo_difficulty,
    crime: crime_GameInfo_difficulty
  };

  // 테마에 맞는 이미지 가져오기
  const GameInfo_backgroundImage = GameInfo_backgroundMap[theme] || horror_GameInfo_background;
  const GameInfo_roomImage = GameInfo_roomMap[theme] || horror_GameInfo_room;
  const GameInfo_starImage = GameInfo_starMap[theme] || horror_GameInfo_rating_star;
  const GameInfo_difficultyImage = GameInfo_difficultyMap[theme] || horror_GameInfo_difficulty;

  // theme 없거나 배경 이미지 없으면 렌더링 안함
  if (!theme || !GameInfo_backgroundImage) return null;

  // EXIT 클릭 시 애니메이션 후 모달 닫기
  const handleExitClick = () => {
    setIsExiting(true);
    setTimeout(() => {
      setShowGameInfo(false); // 부모 컴포넌트의 상태를 false로 변경하여 모달을 닫음
    }, 600); // 애니메이션 종료 시간과 맞추기
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const handlePlayClick = () => {
    setIsPlayClicked(true);
    setLoadingMessage('입장 중 . . .');
    setShowLoading(true);

    setTimeout(() => {
      navigate(`/Theme/${theme}/Play/${gameInfo.game_id}`); // 3초 후 PlayPage로 이동
    }, 3000);  // 3000ms = 3초
  };

  return (
    <div className={`GameInfo_wrap ${isExiting ? 'fadeOut' : ''}`}>
      <img id='GameInfo_background' src={GameInfo_backgroundImage} alt='GameInfo_background' />

      <div className='GameInfo_door_wrap'>
        <div className='GameInfo_door'>
          <div className={`GameInfo_room ${theme}`}>
            <img id='GameInfo_room_img' src={GameInfo_roomImage} alt='GameInfo_room_img' />
            {/* <p>401</p> */}
            <p>{roomNumber}</p>
            <h5 onClick={handleExitClick}>EXIT</h5>
          </div>

          <div className='GameInfo_content'>
            <div className='thumbnail_basic_info'>
              <div className='thumbnail'>
                {/* <img id='thumbnail_img' src={thumbnail_img} alt='thumbnail_img' /> */}
                {gameInfo ? <img id='thumbnail_img' src={`../server/games/${gameInfo.type == 'PnC' ? 'PnC/' : ''}${gameInfo.game_id}/${gameInfo.thumbnail}`} alt='thumbnail_img' />
                : <img id='thumbnail_img' src={thumbnail_img} alt='thumbnail_img' />}
              </div>

              <div className='basic_info'>
                <div className='door_title'>
                  <h4>제목:</h4>
                  {/* <h4>괴물</h4> */}
                  <h4>{gameInfo?.title ?? '괴물'}</h4>
                </div>

                <div className='door_rating'>
                  <h4>평점</h4>
                  <img id='GameInfo_star' src={GameInfo_starImage} alt='GameInfo_star' />
                  <h4>4.8 (1,927)</h4>
                </div>

                <div className='door_difficulty'>
                  <h4>난이도</h4>

                  <div className='door_difficulty_img'>
                    {/* {Array.from({ length: GameInfo_difficulty }).map((_, index) => ( */}
                    {Array.from({ length: gameInfo?.difficulty ?? GameInfo_difficulty }).map((_, index) => (
                      <img 
                          key={index}
                          id='GameInfo_difficulty' 
                          src={GameInfo_difficultyImage} 
                          alt='GameInfo_difficulty' 
                      />
                    ))}
                  </div>
                </div>

                <div className='door_estimated_time'>
                  <h4>예상 소요 시간:</h4>
                  {/* <h4>80분</h4> */}
                  <h4>{gameInfo?.playTime ?? 80}분</h4>
                </div>

                <div className='door_creator'>
                  <h4>제작:</h4>
                  {/* <h4>승혀기</h4> */}
                  <h4>{gameInfo?.user_id ?? '승혀기'}</h4>
                </div>

                <div className='door_date_created'>
                  <h4>제작날짜:</h4>
                  {/* <h4>2025-05-08</h4> */}
                  <h4>{gameInfo?.created_at.slice(0,10) ?? '2025-05-08'}</h4>
                </div>

                <div className='door_play_count'>
                  <img id='player_icon' src={player_icon} alt='player_icon' />
                  {/* <h4>20,450</h4> */}
                  <h4>{gameInfo?.play_count ?? '20,450'}</h4>
                </div>
              </div>
            </div>

            <div
              className={`playgame ${theme} ${isPlayClicked ? 'clicked' : ''}`}
              onClick={handlePlayClick}
            >
              <h4>입장하기</h4>
            </div>

            <div className='GameInfo_introduction'>
              <div className='tabmenu'>
                <div
                  className={`introduction_menu ${theme} ${activeTab === 'introduction' ? 'active' : ''}`}
                  onClick={() => handleTabClick('introduction')}
                >
                  <h4>소개글</h4>
                </div>

                <div
                  className={`gallery_menu ${theme} ${activeTab === 'gallery' ? 'active' : ''}`}
                  onClick={() => handleTabClick('gallery')}
                >
                  <h4>갤러리</h4>
                </div>
              </div>

              <div className='introduction_gallery'>
                {activeTab === 'introduction' && (
                  <div className='introduction' style={{whiteSpace: "pre-line"}}>
                    {/* <p>
                      스토리: “도시는 고요하다. 단 하나, 괴물만이 움직인다.”
                      깨어나 보니 모든 것이 바뀌어 있었다.
                      사라진 사람들, 닫힌 문, 그리고 그 안에서 들리는 무언가의 숨소리…
                      괴물의 정체를 밝혀내고, 살아서 탈출하라. 단, 시간은 많지 않다.<br /><br />
                      처음 만들어본 방탈출입니다!<br />
                      부족한 점이 있을 수도 있지만,<br />
                      열심히 고민하고 재미있게 구성해봤습니다.<br /><br />
                      무섭기도 하고, 당황스럽기도 한 순간들이
                      여러분에게 특별한 기억으로 남았으면 좋겠습니다.
                      긴장도 하면서, 웃기도 하면서
                      가볍게, 재미있게 즐겨주세요!
                      즐거운 플레이 되시길 바랍니다
                      </p> */}
                      <p>{gameInfo?.description ?? '설명입니다'}</p>
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className='gallery'>
                    <div className='gallery_img1'>
                      <img id='gallery1_img' src={gallery1_img} alt='gallery1_img' />
                    </div>

                    <div className='gallery_img2'>
                      <img id='gallery2_img' src={gallery2_img} alt='gallery2_img' />
                    </div>

                    <div className='gallery_img3'>
                      <img id='gallery3_img' src={gallery3_img} alt='gallery3_img' />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameInfo;