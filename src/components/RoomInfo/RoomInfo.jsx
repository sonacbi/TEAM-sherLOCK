import React, { useState } from 'react';

import './RoomInfo.css';

import Room_thumbnail_basic_img from '../../assets/images/RoomInfo/Room_thumbnail_basic_img.png';

function RoomInfo() {
  const [thumbnail, setThumbnail] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setThumbnail(imageUrl);
    }
  };

  return (
    <div className='RoomInfo_wrap'>
      <div className='RoomInfo_content'>
        <div className='Room_title'>
          <p>제목</p>
          <input type='text' placeholder='제목을 입력하세요.'></input>
        </div>

        <div className='Room_thumbnail'>
          <p>썸네일</p>

          <div className='Room_thumbnail_img_button'>
            <div className={`Room_thumbnail_img_wrap ${thumbnail ? 'has-thumbnail' : ''}`}>
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
          <p>소개글</p>
          <input type='text' placeholder='내용을 입력하세요.'></input>
        </div>

        <div className='Room_difficulty'>
          <p>난이도</p>
        </div>

        <div className='Room_playtime'>
          <p>예상소요시간</p>
        </div>

        <div className='Room_theme'>
          <p>테마</p>
        </div>

        <div className='Room_visibility'>
          <p>공개여부</p>
        </div>

        <div className='Room_creator'>
          <p>제작</p>
        </div>
      </div>
    </div>
  );
}

export default RoomInfo;