import React, { useState } from 'react';

import Editor from '../components/Editor/Editor';

import '../styles/EditorPage.css';

function EditorPage() {
    const [addTextTrigger, setAddTextTrigger] = useState(false);

    const handleAddTextBox = () => {
        // 상태를 토글하거나 true로 바꾸면 Editor가 감지하여 텍스트박스 추가
        setAddTextTrigger(prev => !prev);
    };

    return (
        <div className='EditorPage_wrap'>
            <header className='Editor_header'>
                
            </header>

            <div className='Editor_content'>
                <div className='Editor_tool'>
                    <div className='default_tool'>
                        <button onClick={handleAddTextBox}>텍스트 추가</button>
                    </div>

                    <div className='tool_fine_tuning'>

                    </div>
                </div>

                <div className='Editor_screen'>
                    <div className='screen_area'>
                        <div className='screen'>
                            <Editor addTextTrigger={addTextTrigger} />
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