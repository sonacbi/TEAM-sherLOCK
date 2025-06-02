import React, { useState, useEffect, useRef } from 'react';

import './RoomInfo.css';
import { jwtDecode } from 'jwt-decode'; // 유저 정보 디코딩

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
  const [title, setTitle] = useState('');
  const [byteLength, setByteLength] = useState(0);
  const maxBytes = 100;
  const [titleMessage, setTitleMessage] = useState(`현재 0 / ${maxBytes} bytes 사용 중`);

  // 썸네일
  const [thumbnail, setThumbnail] = useState(null); // 최종 썸네일 이미지
  const [thumbnailMessage, setThumbnailMessage] = useState(''); // 메시지 출력 (자동 모달용)
  const [showConfirmButtons, setShowConfirmButtons] = useState(false); // 압축 수락/거절 버튼

  const compressedDataUrlRef = useRef(null); // 압축된 이미지 임시 저장

  const [showModal, setShowModal] = useState(false); // 압축 안내 모달 표시 여부
  const [modalMessage, setModalMessage] = useState(''); // 압축 안내 메시지
  const [modalFadeOut, setModalFadeOut] = useState(false); // 자동 모달 페이드아웃 효과


  // 소개글
  const [ inputScript, setInputScript ] = useState('');
  const [ scriptMessage, setScriptMessage ] = useState('');

  // 난이도
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  
  // 예상소요시간
  const [playtimeHour, setPlaytimeHour] = useState('');
  const [playtimeMin, setPlaytimeMin] = useState('');
  const [playtimeMessage, setPlaytimeMessage] = useState('');
  
  const [selectedTheme, setSelectedTheme] = useState(null);

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

  const [selectedVisibility, setSelectedVisibility] = React.useState(''); // 기본값은 공개로 설정

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
  const getByteLength = (str) => { return new TextEncoder().encode(str).length; }

  const handleTitle = (e) => {
    let value = e.target.value;

    const trimmed = value.trim(); // 앞뒤 공백 제거

    // 실시간 바이트 계산
    let encoded = new TextEncoder().encode(value);
    let bytes = getByteLength(value);

    // 공백만 입력하거나 아무 글자도 없을 때
    if (trimmed.length === 0) {
      setTitle(''); // 상태 초기화
      setByteLength(bytes);
      setTitleMessage(`현재 ${bytes} / ${maxBytes} bytes 사용 중`);
      return;
    }

    if (bytes <= maxBytes) {
        setTitle(value);
        setByteLength(bytes);
        setTitleMessage(`현재 ${bytes} / ${maxBytes} bytes 사용 중`);
      } else {
        // 100바이트 초과한 만큼 잘라냄
        while (bytes > maxBytes) {
          encoded = encoded.slice(0, -1); // 마지막 바이트 제거
          value = new TextDecoder().decode(encoded); // 다시 문자열로 변환
          bytes = getByteLength(value);
        }
        setTitle(value);
        setByteLength(bytes);
        setTitleMessage('100byte를 넘길 수 없습니다.');
      }
    };

  // 포커스 아웃 시 메시지 복구
  const handleTitleBlur = () => {
    setTitleMessage(`현재 ${byteLength} / ${maxBytes} bytes 사용 중`);
  };

  // 썸네일 유효성 검사
  const handleAcceptCompression = () => {
    setThumbnail(compressedDataUrlRef.current);
    setThumbnailMessage('');
    setShowConfirmButtons(false);
    setShowModal(false);
  };

  const handleRejectCompression = () => {
    setThumbnailMessage('이미지 업로드가 취소되었습니다.');
    setShowConfirmButtons(false);
    setThumbnail(null);
    setModalFadeOut(false);
    setShowModal(false);

    setTimeout(() => {
      setModalFadeOut(true);
      setTimeout(() => setThumbnailMessage(''), 500);
    }, 3000);
  };

  const handleImageUpload = (e) => {
    const fileInput = e.target;
    const file = fileInput.files[0];
    if (!file) return;

    setShowConfirmButtons(false);

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSize = 360 * 1024; // 360KB
    const minWidth = 380;
    const minHeight = 480;

    // 1. 형식 검사
    if (!allowedTypes.includes(file.type)) {
      showAutoModal('JPEG, JPG, PNG 형식의 파일만 업로드할 수 있습니다.');
      fileInput.value = ''; // 파일 리셋
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        // 2. 해상도 검사
        if (img.width < minWidth || img.height < minHeight) {
          showAutoModal(`업로드한 이미지 ${img.width}x${img.height}px<br />(최소 ${minWidth}x${minHeight}px 이상 업로드 요망)`);
          fileInput.value = '';
          return;
        }

        // 3. 용량 검사
        if (file.size > maxSize) {
          // 압축
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          let quality = 0.6;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          while (compressedDataUrl.length > maxSize * 1.37 && quality > 0.2) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          compressedDataUrlRef.current = compressedDataUrl;
          setModalMessage('이미지 용량이 360KB를 초과합니다. 용량을 자동으로 압축해서 업로드하시겠습니까?');
          setShowConfirmButtons(true);
          setShowModal(true);
        } else {
          // 문제 없을 때 바로 업로드
          const imageUrl = URL.createObjectURL(file);
          setThumbnail(imageUrl);
          fileInput.value = ''; // 파일 리셋
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const showAutoModal = (message) => {
    setThumbnailMessage(message);
    setShowConfirmButtons(false);
    setModalFadeOut(false);

    setTimeout(() => {
      setModalFadeOut(true);
      setTimeout(() => setThumbnailMessage(''), 500);
    }, 3000);
  };


  const validateScription = (text) => {
    // 1. HTML 태그 제거 검사
    const tagPattern = /<\/?[^>]+>/gi;
    if (tagPattern.test(text)) {
      return 'HTML태그는 사용할 수 없습니다.';
    }

    // 2. 특수 코드 (예: &lt;, &gt;, &nbsp;) 검사
    const entityPattern = /&[a-z]+;/gi;
    if (entityPattern.test(text)) {
      return '특수 문자는 입력할 수 없습니다.';
    }

    // 3. 빈 문자열 검사
    if (text.trim() === '') { return '소개글을 입력해주세요.'; }

    // 4. 길이 제한 (예: 1000자 이내)
    if (text.length > 1000) { return '1000자 이내로 입력해주세요.'; }

    return ''; // 유효할 경우 에러 없음
  };

  const validatePlaytime = (h, m) => {
    // 빈 문자열이면 0으로 처리
    const hour = h === '' ? 0 : parseInt(h, 10);
    const min = m === '' ? 0 : parseInt(m, 10);

    if (isNaN(hour) || isNaN(min)) {
      return '시간에 숫자만 입력해주세요.';
    }

    if (hour < 0 || hour > 3) {
      return '시간(h)은 0~3 사이의 숫자여야 합니다.';
    }

    if (min < 0 || min >= 60) {
      return '분(m)은 0~59 사이로 입력해주세요.';
    }

    const totalMinutes = hour * 60 + min;
    if (totalMinutes > 180) {
      return '총 플레이타임은 3시간(180분)을 넘길 수 없습니다.';
    }

    if(hour === 0 && min === 0) {
      return '시간에 0만 입력할 수 없습니다.'
    }
    return '';
  };

    const handleDifficultyClick = (level) => {
    setSelectedDifficulty(level);
  };

  const handleThemeClick = (theme) => {
    setSelectedTheme(theme);
  };

const handleSubmit = () => {
    // 제목 검사
    if (!title || getByteLength(title) === 0) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (getByteLength(title) > maxBytes) {
      alert(`제목은 최대 ${maxBytes}바이트까지 가능합니다.`);
      return;
    }

    // 썸네일 검사
    if (!thumbnail) {
      alert('썸네일 이미지를 업로드해주세요.');
      return;
    }

    // 소개글 검사
    const introMsg = validateScription(inputScript);
    if (introMsg) {
      alert(introMsg);
      return;
    }

    // 예상 소요 시간 검사
    const timeMsg = validatePlaytime(playtimeHour, playtimeMin);
    if (timeMsg) {
      alert(timeMsg);
      return;
    }

    // 난이도 검사
    if (![1, 2, 3, 4, 5].includes(selectedDifficulty)) {
      alert('난이도를 선택해주세요.');
      return;
    }

    // 테마 검사
    if (!['horror', 'adventure', 'crime'].includes(selectedTheme)) {
      alert('테마를 선택해주세요.');
      return;
    }

    // 공개 여부 검사
    if (!['public', 'limited', 'private'].includes(selectedVisibility)) {
      alert('공개여부를 선택해주세요.');
      return;
    }

    // 여기서 실제 저장 API 호출 등 수행 (백엔드 업무)
    alert('저장 완료!');
  };



  return (
    <div className='RoomInfo_wrap'>
      <div className='RoomInfo_content'>
        <div className='Room_title'>
          <div className='title_precautions'>
            <p>제목</p>
            <span>{titleMessage}</span>
          </div>
          <input type='text' placeholder='제목을 입력하세요.' value={title} onChange={handleTitle} onBlur={handleTitleBlur}></input>
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

            <button onClick={() => document.getElementById('thumbnailInput').click()}>사진첨부</button>
          </div>
        </div>

        <div className='Room_introduction'>
          <div className='introduction_precautions'>
            <p>소개글</p>
            <span>{scriptMessage || ''}</span>
          </div>
          <textarea placeholder='내용을 입력하세요.'
            value={inputScript}
            onChange={(e) => {
            const value = e.target.value;
            setInputScript(value);
            setScriptMessage(validateScription(value)); // 실시간 검사
            }} onBlur={() => {
              if (!validateScription(inputScript)) { // 에러가 없으면 안내 문구 표시를 위해 빈 문자열로 초기화
                setScriptMessage(''); }
            }}>
          </textarea>
        </div>

        <div className='Room_difficulty'>
          <div className='Room_difficulty_select'>
            <p>난이도</p>
            <span>선택: {selectedDifficulty ? difficultyText[selectedDifficulty] : '??'}</span>
          </div>

          <div className='difficulty_wrap'>
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
                onChange={(e) => {
                  const onlyNumbers = e.target.value.replace(/[^0-9]/g, '');
                  setPlaytimeMin(onlyNumbers === '' ? '' : Number(onlyNumbers));
                  // 여기 두 번째 인자를 playtimeMin -> onlyNumbers로 변경!
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
            <span>선택: {selectedTheme ? themeTextMap[selectedTheme] : '??'}</span>
          </div>

          <div className='Room_theme_wrap'>
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

        <div className='Room_visibility'>
          <div className='visibility_precautions'>
            <p>공개여부</p>
            <span></span>
          </div>

          <div className='visibility_wrap'>
            <div className='public'>
              <div className='icon_wrap'>
                <img id='public_icon' src={public_icon} alt='public_icon' />
              </div>
              
              <input type='radio' name='visibility' value='public'
              checked={selectedVisibility === 'public'} 
              onChange={(e) => setSelectedVisibility(e.target.value)} ></input>
              <p>공개</p>
            </div>

            <div className='limited'>
              <div className='icon_wrap'>
                <img id='limited_icon' src={limited_icon} alt='limited_icon' />
              </div>

              <input type='radio' name='visibility' value='limited'
              checked={selectedVisibility === 'limited'} 
              onChange={(e) => setSelectedVisibility(e.target.value)} ></input>
              <p>일부공개</p>
            </div>

            <div className='private'>
              <div className='icon_wrap'>
                <img id='private_icon' src={private_icon} alt='private_icon' />
              </div>

              <input type='radio' name='visibility' value='private'
              checked={selectedVisibility === 'private'} 
              onChange={(e) => setSelectedVisibility(e.target.value)} ></input>
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