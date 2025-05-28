import React from 'react';

import './RoomInfo.css';

import RoomInfo_background from '../../assets/images/RoomInfo/RoomInfo_background.png';
import Room_room_img from '../../assets/images/ThemePage_img/horror/horror_room.png';

function RoomInfo() {
  return (
    <div className='RoomInfo_wrap'>
        <img id='RoomInfo_background' src={RoomInfo_background} alt='RoomInfo_background' />

        <div className='Room_door_wrap'>
            <div className='Room_door'>
                <div className='Room_room'>
                    <img id='Room_room_img' src={Room_room_img} alt='Room_room_img' />
                    <p>방 정보</p>
                    <h5>EXIT</h5>
                </div>

                <div className='Room_content'>

                </div>
            </div>
        </div>
    </div>
  );
}

export default RoomInfo;