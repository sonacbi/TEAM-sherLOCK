import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import Editor from '../components/Editor/Editor';
import '../styles/EditorPage.css';

import logo from '../assets/images/logo/footer_logo.png'
import save_icon from '../assets/images/EditorPage_img/save_icon.png';
import text_icon from '../assets/images/EditorPage_img/text_icon.png';
import shape_icon from '../assets/images/EditorPage_img/shape_icon.png';
import picture_icon from '../assets/images/EditorPage_img/picture_icon.png';
import timer_icon from '../assets/images/EditorPage_img/timer_icon.png';
import hint_icon from '../assets/images/EditorPage_img/hint_icon.png';
import event_icon from '../assets/images/EditorPage_img/event_icon.png';

function EditorPage() {
    const [addTextTrigger, setAddTextTrigger] = useState(0);
    const [addShapeTrigger, setAddShapeTrigger] = useState(0);
    const [addImageFile, setAddImageFile] = useState(null);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();

    const handleAddTextBox = () => {
        setAddTextTrigger(Date.now());
    };

    const handleAddShape = () => {
        setAddShapeTrigger(Date.now());
    };

    const handleAddImage = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAddImageFile(file);
        }
    };

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
                        <div className='text_area' onClick={handleAddTextBox}>
                            <img id='text_icon' src={text_icon} alt='text_icon' />
                            <p>텍스트</p>
                        </div>

                        <div className='shape_area' onClick={handleAddShape}>
                            <img id='shape_icon' src={shape_icon} alt='shape_icon' />
                            <p>도형</p>
                        </div>

                        <div className='picture_area' onClick={handleAddImage}>
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

                        <div className='timer_area'>
                            <img id='timer_icon' src={timer_icon} alt='timer_icon' />
                            <p>타이머</p>
                        </div>

                        <div className='hint_area'>
                            <img id='hint_icon' src={hint_icon} alt='hint_icon' />
                            <p>힌트</p>
                        </div>

                        <div className='event_area'>
                            <img id='event_icon' src={event_icon} alt='event_icon' />
                            <p>이벤트</p>
                        </div>
                    </div>

                    <div className='tool_fine_tuning'>

                    </div>
                </div>

                <div className='Editor_screen'>
                    <div className='screen_area'>
                        <div className='screen'>
                            <Editor addTextTrigger={addTextTrigger} addShapeTrigger={addShapeTrigger} addImageFile={addImageFile} />
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