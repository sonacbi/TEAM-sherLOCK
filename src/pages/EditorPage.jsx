import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Editor from '../components/Editor/Editor';
import '../styles/EditorPage.css';

import logo from '../assets/images/logo/footer_logo.png'
import save_icon from '../assets/images/EditorPage_img/save_icon.png';
import frame_icon from '../assets/images/EditorPage_img/frame_icon.png';
import text_icon from '../assets/images/EditorPage_img/text_icon.png';
import shape_icon from '../assets/images/EditorPage_img/shape_icon.png';
import picture_icon from '../assets/images/EditorPage_img/picture_icon.png';
import timer_icon from '../assets/images/EditorPage_img/timer_icon.png';
import hint_icon from '../assets/images/EditorPage_img/hint_icon.png';
import event_icon from '../assets/images/EditorPage_img/event_icon.png';
import rectangle from '../assets/images/EditorPage_img/default_shape/rectangle.png';
import circle from '../assets/images/EditorPage_img/default_shape/circle.png';
import triangle from '../assets/images/EditorPage_img/default_shape/triangle.png';
import rhombus from '../assets/images/EditorPage_img/default_shape/rhombus.png';
import star from '../assets/images/EditorPage_img/default_shape/star.png';
import heart from '../assets/images/EditorPage_img/default_shape/heart.png';
import pentagon from '../assets/images/EditorPage_img/default_shape/pentagon.png';
import trapezoid from '../assets/images/EditorPage_img/default_shape/trapezoid.png';
import bubble1 from '../assets/images/EditorPage_img/bubble/bubble1.png';
import bubble2 from '../assets/images/EditorPage_img/bubble/bubble2.png';
import bubble3 from '../assets/images/EditorPage_img/bubble/bubble3.png';
import bubble4 from '../assets/images/EditorPage_img/bubble/bubble4.png';
import bubble5 from '../assets/images/EditorPage_img/bubble/bubble5.png';
import bubble6 from '../assets/images/EditorPage_img/bubble/bubble6.png';
import bubble7 from '../assets/images/EditorPage_img/bubble/bubble7.png';
import bubble8 from '../assets/images/EditorPage_img/bubble/bubble8.png';

function EditorPage() {
    const [addTextTrigger, setAddTextTrigger] = useState(0);
    const [addShapeTrigger, setAddShapeTrigger] = useState('');
    const [addImageFile, setAddImageFile] = useState(null);
    const [addFrameTrigger, setAddFrameTrigger] = useState(0);

    const [roomFrameState, setRoomFrameState] = useState([220, 120, 440, 300, 170, 240, 240, 150]);

    const fileInputRef = useRef(null);

    const [selectedTool, setSelectedTool] = useState('frame');

    const navigate = useNavigate();

    const handleAddFrame = () => {
        setAddFrameTrigger(Date.now());
        setSelectedTool('frame');
    };

    const handleAddTextBox = () => {
        setAddTextTrigger(Date.now());
        setSelectedTool('text');
    };
    
    const shapeImages = {
        rectangle,
        circle,
        triangle,
        rhombus,
        star,
        heart,
        pentagon,
        trapezoid,
    };

    const handleShapeFineTuning = () => {
        setSelectedTool('shape');
    };

    const handleShapeClick = (shape) => {
        setAddShapeTrigger(''); // 상태 초기화
        setTimeout(() => {
            setAddShapeTrigger(shape); // 선택한 도형 설정
        }, 0);
    };

    const handleAddImage = () => {
        fileInputRef.current.click();
        setSelectedTool('picture');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAddImageFile(file);
        }
    };

    const handleAddTimer = () => {
        setSelectedTool('timer');
    };

    const handleAddHint = () => {
        setSelectedTool('hint');
    };

    const handleAddEvent = () => {
        setSelectedTool('event');
    };

    const handelRoomFrameState = (event, index) => {
        setRoomFrameState(prev => {
            const newArray = [...prev];
            newArray[index] = Number(event.target.value);
            return newArray;
        })
    }

    return (
        <div className='EditorPage_wrap'>
            <header className='Editor_header'>
                <h3 onClick={() => navigate(-1)}>◀ EXIT</h3>
                <img id='logo' src={logo} alt='logo' />

                <div className='room_status_title'>
                    <p className='room_status_button'>방탈출 정보</p>
                    <label>제목: ???</label>
                </div>

                <div className='save_submit'>
                    <p className='save_button' title='저장하기'>
                        <img id='save_icon' src={save_icon} alt='save_icon' />
                    </p>
                    
                    <p className='submit_button'>제출</p>
                </div>
            </header>

            <div className='Editor_content'>
                <div className='Editor_tool'>
                    <div className='default_tool'>
                        <div className={`frame_area ${selectedTool === 'frame' ? 'active' : ''}`} onClick={handleAddFrame}>
                            <img id='frame_icon' src={frame_icon} alt='frame_icon' />
                            <p>프레임</p>
                        </div>

                        <div className={`text_area ${selectedTool === 'text' ? 'active' : ''}`} onClick={handleAddTextBox}>
                            <img id='text_icon' src={text_icon} alt='text_icon' />
                            <p>텍스트</p>
                        </div>

                        <div className={`shape_area ${selectedTool === 'shape' ? 'active' : ''}`} onClick={handleShapeFineTuning}>
                            <img id='shape_icon' src={shape_icon} alt='shape_icon' />
                            <p>도형</p>
                        </div>

                        <div className={`picture_area ${selectedTool === 'picture' ? 'active' : ''}`} onClick={handleAddImage}>
                            <img id='picture_icon' src={picture_icon} alt='picture_icon' />
                            <p>사진</p>
                            <input
                                type='file'
                                accept='image/*'
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <div className={`timer_area ${selectedTool === 'timer' ? 'active' : ''}`} onClick={handleAddTimer}>
                            <img id='timer_icon' src={timer_icon} alt='timer_icon' />
                            <p>타이머</p>
                        </div>

                        <div className={`hint_area ${selectedTool === 'hint' ? 'active' : ''}`} onClick={handleAddHint}>
                            <img id='hint_icon' src={hint_icon} alt='hint_icon' />
                            <p>힌트</p>
                        </div>

                        <div className={`event_area ${selectedTool === 'event' ? 'active' : ''}`} onClick={handleAddEvent}>
                            <img id='event_icon' src={event_icon} alt='event_icon' />
                            <p>이벤트</p>
                        </div>
                    </div>

                    <div className='tool_fine_tuning'>
                        {selectedTool === 'frame' && (
                            <div className='frame_fine_tuning'>
                                x: <input id="roomFrame0" type="range" min={0} max={330} value={roomFrameState[0]} step={10} list='' onChange={event => handelRoomFrameState(event, 0)}/> {roomFrameState[0]} <br />
                                y: <input id="roomFrame0" type="range" min={0} max={330} value={roomFrameState[1]} step={10} list='' onChange={event => handelRoomFrameState(event, 1)}/> {roomFrameState[1]} <br />
                                width: <input id="roomFrame0" type="range" min={0} max={330} value={roomFrameState[2]} step={10} list='' onChange={event => handelRoomFrameState(event, 2)}/> {roomFrameState[2]} <br />
                                height: <input id="roomFrame0" type="range" min={0} max={330} value={roomFrameState[3]} step={10} list='' onChange={event => handelRoomFrameState(event, 3)}/> {roomFrameState[3]} <br />
                                top: <input id="roomFrame0" type="range" min={0} max={330} value={roomFrameState[4]} step={10} list='' onChange={event => handelRoomFrameState(event, 4)}/> {roomFrameState[4]} <br />
                                left: <input id="roomFrame0" type="range" min={0} max={330} value={roomFrameState[5]} step={10} list='' onChange={event => handelRoomFrameState(event, 5)}/> {roomFrameState[5]} <br />
                                right: <input id="roomFrame0" type="range" min={0} max={330} value={roomFrameState[6]} step={10} list='' onChange={event => handelRoomFrameState(event, 6)}/> {roomFrameState[6]} <br />
                                bottom: <input id="roomFrame0" type="range" min={0} max={330} value={roomFrameState[7]} step={10} list='' onChange={event => handelRoomFrameState(event, 7)}/> {roomFrameState[7]} <br />
                            </div>
                        )}

                        {selectedTool === 'text' && (
                            <div className='text_fine_tuning'>
                                <h2>텍스트 세부조정</h2>
                            </div>
                        )}

                        {selectedTool === 'shape' && (
                            <div className='shape_fine_tuning'>
                                <div className='default_shape'>
                                    <label>기본 도형</label>
                                    
                                    <div className='default_shape_wrap'>
                                        {Object.keys(shapeImages).map((shape) => (
                                            <img
                                                key={shape}
                                                src={shapeImages[shape]}
                                                alt={shape}
                                                onClick={() => handleShapeClick(shape)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className='bubble'>
                                    <label>말풍선</label>
                                    
                                    <div className='bubble_wrap'>
                                        <img id='bubble1' src={bubble1} alt='bubble1' />
                                        <img id='bubble2' src={bubble2} alt='bubble2' />
                                        <img id='bubble3' src={bubble3} alt='bubble3' />
                                        <img id='bubble4' src={bubble4} alt='bubble4' />
                                        <img id='bubble5' src={bubble5} alt='bubble5' />
                                        <img id='bubble6' src={bubble6} alt='bubble6' />
                                        <img id='bubble7' src={bubble7} alt='bubble7' />
                                        <img id='bubble8' src={bubble8} alt='bubble8' />
                                    </div>
                                </div>
                            </div>
                        )}

                        {selectedTool === 'picture' && (
                            <div className='picture_fine_tuning'>
                                <h2>사진 세부조정</h2>
                            </div>
                        )}

                        {selectedTool === 'timer' && (
                            <div className='timer_fine_tuning'>
                                <h2>타이머 세부조정</h2>
                            </div>
                        )}

                        {selectedTool === 'hint' && (
                            <div className='hint_fine_tuning'>
                                <h2>힌트 세부조정</h2>
                            </div>
                        )}
                        
                        {selectedTool === 'event' && (
                            <div className='event_fine_tuning'>
                                <h2>이벤트 세부조정</h2>
                            </div>
                        )}
                    </div>
                </div>

                <div className='Editor_screen'>
                    <div className='screen_area'>
                        <div className='screen'>
                            <Editor addTextTrigger={addTextTrigger} addShapeTrigger={addShapeTrigger} addImageFile={addImageFile} addFrameTrigger={addFrameTrigger} roomFrameState={roomFrameState}/>
                        </div>
                    </div>

                    <div className='stage_area'>

                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditorPage;