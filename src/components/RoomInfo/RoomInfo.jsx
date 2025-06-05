import React, { useState, useEffect, useRef } from 'react';
import { jwtDecode } from 'jwt-decode'; // 유저 정보 디코딩

import './RoomInfo.css';
import { useTitleByteHandler, useThumbnailUpload, getByteLength, validateScription, validatePlaytime } from './RoomInfo_validate';

import Room_thumbnail_basic_img from '../../assets/images/RoomInfo/Room_thumbnail_basic_img.png';
import Room_theme_horror_img from '../../assets/images/MainPage_img/horror_icon.png'
import Room_theme_adventure_img from '../../assets/images/MainPage_img/adventure_icon.png'
import Room_theme_crime_img from '../../assets/images/MainPage_img/crime_icon.png'
import public_icon from '../../assets/images/RoomInfo/public_icon.png';
import private_icon from '../../assets/images/RoomInfo/private_icon.png';
import limited_icon from '../../assets/images/RoomInfo/limited_icon.png';
import creator_profile from '../../assets/images/Profile/ex_user_profile.png';


function RoomInfo() {
  // 타이틀
  const maxBytes = 100;
  const [title, setTitle] = useState('');
  const [byteLength, setByteLength] = useState(0);
  const [titleMessage, setTitleMessage] = useState(`현재 0 / ${maxBytes} bytes 사용 중`);

  // 썸네일
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailMessage, setThumbnailMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showConfirmButtons, setShowConfirmButtons] = useState(false);
  const [modalFadeOut, setModalFadeOut] = useState(true);
  const [modalMessage, setModalMessage] = useState('');

  // 소개글
  const [ inputScript, setInputScript ] = useState('');
  const [ scriptMessage, setScriptMessage ] = useState('');
  const maxScriptByte = 1000;
  const [ scriptByteLength, setScriptByteLength ] = useState(0);

  // 난이도
  const [selectedDifficulty, setSelectedDifficulty ] = useState(null);
  const [ difficultyMessage, setDifficultyMessage ] = useState('');
  
  // 예상소요시간
  const [playtimeHour, setPlaytimeHour] = useState('');
  const [playtimeMin, setPlaytimeMin] = useState('');
  const [playtimeMessage, setPlaytimeMessage] = useState('');
  
  const [selectedTheme, setSelectedTheme] = useState(null);
  const [ themeMessage, setThemeMessage ] = useState('');

  const [userToken, setUserToken] = useState(null); // 사용자 토큰 상태

  const difficultyText = {
    1: '최하',
    2: '하',
    3: '중',
    4: '상',
    5: '최상',
  };

  const themeTextMap = {
    horror: '호러',
    adventure: '모험',
    crime: '범죄',
  };

  const [selectedVisibility, setSelectedVisibility] = React.useState(''); // 기본값은 빈값으로 설정
  const [ visibilityMessage, setVisibilityMessage ] = useState('');

  // 유효성 검사 통과 못하면 이쪽으로 시선 집중(포커스)
  const titleRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const scriptionRef = useRef(null);
  const hourRef = useRef(null);
  const minRef = useRef(null);
  const difficultyRef = useRef(null);
  const themeRef = useRef(null);
  const visibilityRef = useRef(null);

  // 컴포넌트가 마운트될 때 localStorage에서 토큰 읽고 디코딩
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log("🧾 디코딩된 결과:", decoded);
        setUserToken(decoded); // 전체 객체 저장
      } catch (error) {
        console.error("❌ 토큰 디코딩 실패:", error);
        setUserToken(null);
      }
    } else {
      console.warn("⚠️ 토큰 없음");
      setUserToken(null);
    }
  }, []);

  // 제목 영역의 글자수(바이트로 체크)
  const {
    handleTitle,
    handleTitleBlur,
  } = useTitleByteHandler(100, title, setTitle, byteLength, setByteLength, titleMessage, setTitleMessage );

  // 썸네일 유효성 검사
  const { handleImageUpload, handleAcceptCompression, handleRejectCompression,
  } = useThumbnailUpload(thumbnail, setThumbnail, thumbnailMessage, setThumbnailMessage, showModal, setShowModal, showConfirmButtons, setShowConfirmButtons, modalFadeOut, setModalFadeOut, modalMessage, setModalMessage);
  
  
  const handleDifficultyClick = (level) => {
    setSelectedDifficulty(level);
    setDifficultyMessage(''); // 선택하면 메시지 지우기
  };

  const handleThemeClick = (theme) => {
    setSelectedTheme(theme);
    setThemeMessage(''); // 선택하면 메시지 지우기
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 이거 없으면 자동 리로드됨
    
    // 제목 검사
    if (!title || getByteLength(title) === 0) {
      setTitleMessage('제목을 입력해주세요.');
      titleRef.current?.focus(); // 제목 입력란으로 포커스 이동
      return;
    }
    if (getByteLength(title) > maxBytes) {
      setTitleMessage(`${maxBytes}byte를 넘길 수 없습니다.`);
      titleRef.current?.focus(); // 제목 입력란으로 포커스 이동
      return;
    }

    // 썸네일 검사
    if (!thumbnail) {
      console.log("코드 체크");
      setThumbnailMessage("썸네일 이미지를 업로드해주세요.");
      setModalFadeOut(false);

      // 바로 포커스 후 클릭을 약간 딜레이 줘서 실행
      const input = thumbnailInputRef.current;
      if (input) { input.focus(); }
      setTimeout(() => { setModalFadeOut(true); setTimeout(() => setThumbnailMessage(''), 500);
      }, 4000);

      return;
    }

    // 소개글 검사
    const scriptValue = scriptionRef.current?.value || ''; // 직접 가져오기
    const ScriptMsg = validateScription(scriptValue);
    setInputScript(scriptionRef.current?.value); // 확실히 값처리

    if (ScriptMsg) {
      setScriptMessage(ScriptMsg); // 메시지 표시
      scriptionRef.current?.focus(); // 소개글 입력란 포커스
      return;
    }

    // 난이도 검사
    if (![1, 2, 3, 4, 5].includes(selectedDifficulty)) {
      if (selectedDifficulty === null) {
        setDifficultyMessage("난이도를 선택해주세요.");
        visibilityRef.current?.scrollIntoView({ behavior: 'smooth' });
        return;
      } else {
        setDifficultyMessage(''); // 통과되면 메시지 제거
      }
      difficultyRef.current?.focus(); // 난이도 선택 영역으로 포커스
      return;
    }

    // 예상 소요 시간 검사
    const timeMsg = validatePlaytime(playtimeHour, playtimeMin);
    if (timeMsg) {
      setPlaytimeMessage(timeMsg);

      if (playtimeHour === '' || parseInt(playtimeHour) < 0 || parseInt(playtimeHour) > 3) {
        hourRef.current?.focus();
      } else {
        minRef.current?.focus();
      }
      return;
    }

    // 테마 검사
    if (!['horror', 'adventure', 'crime'].includes(selectedTheme)) {
      setThemeMessage('테마를 선택해주세요.'); // 메시지 상태 업데이트
      themeRef.current?.focus();
      return;
    } else {
      setThemeMessage(''); // 통과 시 메시지 초기화
    }

    // 공개 여부 검사
    if (!['public', 'limited', 'private'].includes(selectedVisibility)) {
      setVisibilityMessage('공개여부를 선택해주세요.');
      visibilityRef.current?.focus();
      return;
    }else {
      setVisibilityMessage(''); // 통과 시 메시지 초기화
    }

    // 여기서 실제 저장 API 호출 등 수행 (백엔드 업무)
    alert('저장 완료!');
    /* 저장데이터를 정련할 일련의 코드 만들어주시면 될 것 같아요.*/
  };

  return (
    <div className='RoomInfo_wrap'>
      <div className='RoomInfo_content'>
        <div className='Room_title'>
          <div className='title_precautions'>
            <p>제목</p>
            <span>{titleMessage}</span>
          </div>
          <input type='text' ref={titleRef} placeholder='제목을 입력하세요.' value={title} onChange={handleTitle} onBlur={handleTitleBlur}></input>
        </div>

        <div className='Room_thumbnail'>
          <div className='thumbnail_precautions'>
            <p>썸네일</p>
            <span> </span>
          </div>

          <div className='Room_thumbnail_img_button'>
            <div className={`Room_thumbnail_img_wrap ${thumbnail ? 'has-thumbnail' : ''}`}>
              {showModal && (
                <div className="modal_overlay">
                  <div className="modal_box">
                    <p>{modalMessage}</p>
                    <div className="modal_buttons">
                      <button onClick={handleAcceptCompression}>수락</button>
                      <button onClick={handleRejectCompression}>거부</button>
                    </div>
                  </div>
                </div>
              )}

              {thumbnailMessage && (
                <div
                  className={`auto_modal ${modalFadeOut ? 'fade-out' : ''}`}
                  dangerouslySetInnerHTML={{ __html: thumbnailMessage }} // 엔터 표시용
                />
              )}

              {!thumbnail && (
                <div className='Room_thumbnail_basic_wrap'>
                  <img id='Room_thumbnail_basic_img' src={Room_thumbnail_basic_img} alt='Room_thumbnail_basic_img' />
                  <h5>* 380 X 480 이상</h5>
                </div>
              )}

              {thumbnail && (
                <img id='Room_thumbnail_img' src={thumbnail} alt='Room_thumbnail_img' />
              )}
            </div>

            <input
              type='file'
              accept='image/*'
              id='thumbnailInput'
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            <button onClick={() => document.getElementById('thumbnailInput').click()} ref={thumbnailInputRef}>사진첨부</button>
          </div>
        </div>

        <div className='Room_introduction'>
          <div className='introduction_precautions'>
            <p>소개글</p>
            <span>
              {scriptMessage ? scriptMessage : `현재 ${scriptByteLength} / ${maxScriptByte} bytes 사용 중`}
            </span>
          </div>
          <textarea
            placeholder='내용을 입력하세요.'
            value={inputScript}
            ref={scriptionRef}
            onChange={(e) => {
              let value = e.target.value;
              let encoded = new TextEncoder().encode(value);
              let bytes = encoded.length;

              // 바이트 제한 초과 시 자르기
              while (bytes > maxScriptByte) {
                encoded = encoded.slice(0, -1);
                value = new TextDecoder().decode(encoded);
                bytes = encoded.length;
              }

              setInputScript(value);
              setScriptByteLength(bytes);
              setScriptMessage(validateScription(value));
            }}
            onBlur={() => {
              if (!validateScription(inputScript)) {
                setScriptMessage('');
              }
            }}
          />
        </div>

        <div className='Room_difficulty'>
          <div className='Room_difficulty_select'>
            <p>난이도</p>
            <span>
              {difficultyMessage
              ? difficultyMessage
              : `선택: ${selectedDifficulty ? difficultyText[selectedDifficulty] : '??'}`}
            </span>
          </div>

          <div className='difficulty_wrap' ref={difficultyRef}>
            {[1, 2, 3, 4, 5].map((level) => {
              const className = `difficulty_${['one', 'two', 'three', 'four', 'five'][level - 1]} ${
                selectedDifficulty === level ? 'selected' : ''
              }`;

              return (
                <div
                  key={level}
                  className={className}
                  onClick={() => handleDifficultyClick(level)}
                >
                  <p>{level}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className='Room_playtime'>
          <p>예상소요시간</p>

          <div className='playtime_wrap'>
          <div className='hour_wrap'>
            <input
              type='text'
              placeholder='?'
              value={playtimeHour}
              ref={hourRef}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                setPlaytimeHour(onlyNumbers === '' ? '' : Number(onlyNumbers));
                const msg = validatePlaytime(onlyNumbers === '' ? '' : Number(onlyNumbers), playtimeMin);
                setPlaytimeMessage(msg);
              }}

            />
            <p>h</p>
          </div>

            <div className='min_wrap'>
              <input
                type='text'
                placeholder='??'
                value={playtimeMin}
                ref={minRef}
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                  setPlaytimeMin(onlyNumbers === '' ? '' : Number(onlyNumbers));
                  const msg = validatePlaytime(playtimeHour, onlyNumbers === '' ? '' : Number(onlyNumbers));
                  setPlaytimeMessage(msg);
                }}
              />
              <p>m</p>
            </div>
          </div>
          <span className={playtimeMessage.includes('시간') ? 'tooltip tooltip-h' : playtimeMessage.includes('분') ? 'tooltip tooltip-m' : ''}>
            {playtimeMessage || ''}
          </span>
        </div>

        <div className='Room_theme'>
          <div className='Room_theme_select'>
            <p>테마</p>
            <span>
              {themeMessage
              ? themeMessage
              : `선택: ${selectedTheme ? themeTextMap[selectedTheme] : '??'}`}
            </span>
          </div>

          <div className='Room_theme_wrap'  ref={themeRef}>
            <div
              className={`theme_horror ${selectedTheme === 'horror' ? 'selected' : ''}`}
              onClick={() => handleThemeClick('horror')}
            >
              <img id='theme_horror_img' src={Room_theme_horror_img} alt='theme_horror_img' />
            </div>

            <div
              className={`theme_adventure ${selectedTheme === 'adventure' ? 'selected' : ''}`}
              onClick={() => handleThemeClick('adventure')}
            >
              <img id='theme_adventure_img' src={Room_theme_adventure_img} alt='theme_adventure_img' />
            </div>

            <div
              className={`theme_crime ${selectedTheme === 'crime' ? 'selected' : ''}`}
              onClick={() => handleThemeClick('crime')}
            >
              <img id='theme_crime_img' src={Room_theme_crime_img} alt='theme_crime_img' />
            </div>
          </div>
        </div>

        <div className='Room_visibility' ref={visibilityRef}>
          <div className='visibility_precautions'>
            <p>공개여부</p>
            <span>{visibilityMessage}</span>
          </div>

          <div className='visibility_wrap'>
            <div className='public'>
              <div className='icon_wrap'>
                <img id='public_icon' src={public_icon} alt='public_icon' />
              </div>
              
              <input type='radio' name='visibility' value='public'
              checked={selectedVisibility === 'public'} 
              onChange={(e) => { setSelectedVisibility(e.target.value); setVisibilityMessage(''); }} ></input>
              <p>공개</p>
            </div>

            <div className='limited'>
              <div className='icon_wrap'>
                <img id='limited_icon' src={limited_icon} alt='limited_icon' />
              </div>

              <input type='radio' name='visibility' value='limited'
              checked={selectedVisibility === 'limited'} 
              onChange={(e) => { setSelectedVisibility(e.target.value); setVisibilityMessage(''); }} ></input>
              <p>일부공개</p>
            </div>

            <div className='private'>
              <div className='icon_wrap'>
                <img id='private_icon' src={private_icon} alt='private_icon' />
              </div>

              <input type='radio' name='visibility' value='private'
              checked={selectedVisibility === 'private'} 
              onChange={(e) => { setSelectedVisibility(e.target.value); setVisibilityMessage(''); }} ></input>
              <p>비공개</p>
            </div>
          </div>
        </div>

        <div className='Room_creator'>
          <p>제작</p>

          <div className='Room_profile_creator'>
            <div className='Room_profile'>
              <img id='creator_profile' src={creator_profile} alt='creator_profile' />
            </div>

            <div className='creator_name'>
              <p>{userToken?.user_name || '게스트'}</p>
            </div>
          </div>
        </div>

        <div className='Room_save_button'>
          <button onClick={handleSubmit}>저장</button>
        </div>
      </div>
    </div>
  );
}

export default RoomInfo;