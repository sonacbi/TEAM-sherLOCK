import React, { useState } from 'react';

import './RoomInfo.css';

import Room_thumbnail_basic_img from '../../assets/images/RoomInfo/Room_thumbnail_basic_img.png';
import Room_theme_horror_img from '../../assets/images/MainPage_img/horror_icon.png'
import Room_theme_adventure_img from '../../assets/images/MainPage_img/adventure_icon.png'
import Room_theme_crime_img from '../../assets/images/MainPage_img/crime_icon.png'
import public_icon from '../../assets/images/RoomInfo/public_icon.png';
import private_icon from '../../assets/images/RoomInfo/private_icon.png';
import limited_icon from '../../assets/images/RoomInfo/limited_icon.png';

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

          <div className='text_precautions'>
            <input type='text' placeholder='제목을 입력하세요.'></input>
            <p></p>
          </div>
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

          <div className='introduction_precautions'>
            <textarea placeholder='내용을 입력하세요.'>

            </textarea>

            <p></p>
          </div>
        </div>

        <div className='Room_difficulty'>
          <div className='Room_difficulty_select'>
            <p>난이도</p>
            <span>선택: ??</span>
          </div>

          <div className='difficulty_wrap'>
            <div className='difficulty_one'><p>1</p></div>
            <div className='difficulty_two'><p>2</p></div>
            <div className='difficulty_three'><p>3</p></div>
            <div className='difficulty_four'><p>4</p></div>
            <div className='difficulty_five'><p>5</p></div>
          </div>
        </div>

        <div className='Room_playtime'>
          <p>예상소요시간</p>

          <div className='playtime_wrap'>
            <div className='hour_wrap'>
              <input type='text' placeholder='?'></input>
              <p>h</p>
            </div>

            <div className='min_wrap'>
              <input type='text' placeholder='??'></input>
              <p>m</p>
            </div>
          </div>
        </div>

        <div className='Room_theme'>
          <div className='Room_theme_select'>
            <p>테마</p>
            <span>선택: ??</span>
          </div>

          <div className='theme_wrap'>
            <div className='theme_horror'>
              <img id='theme_horror_img' src={Room_theme_horror_img} alt='theme_horror_img' />
            </div>

            <div className='theme_adventure'>
              <img id='theme_adventure_img' src={Room_theme_adventure_img} alt='theme_adventure_img' />
            </div>

            <div className='theme_crime'>
              <img id='theme_crime_img' src={Room_theme_crime_img} alt='theme_crime_img' />
            </div>
          </div>
        </div>

        <div className='Room_visibility'>
          <p>공개여부</p>

          <div className='visibility_wrap'>
            <div className='public'>
              <div className='icon_wrap'>
                <img id='public_icon' src={public_icon} alt='public_icon' />
              </div>
              
              <input type='radio' name='visibility' value='public'></input>
              <p>공개</p>
            </div>

            <div className='limited'>
              <div className='icon_wrap'>
                <img id='limited_icon' src={limited_icon} alt='limited_icon' />
              </div>

              <input type='radio' name='visibility' value='limited'></input>
              <p>일부공개</p>
            </div>

            <div className='private'>
              <div className='icon_wrap'>
                <img id='private_icon' src={private_icon} alt='private_icon' />
              </div>

              <input type='radio' name='visibility' value='private'></input>
              <p>비공개</p>
            </div>
          </div>
        </div>

        <div className='Room_creator'>
          <p>제작</p>
        </div>
      </div>
    </div>
  );
}

export default RoomInfo;