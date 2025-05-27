import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Editor from '../components/Editor/Editor';
import SaveToServer from '../components/Editor/SaveToServer';
import { GamePnC, Room, Side } from '../../modules/editor/gamePnC';
import { GameInfo } from '../../modules/game-modules';
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
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [game, setGame] = useState(new GamePnC({}));
    const [room, setRoom] = useState(new Room({}));
    const [side, setSide] = useState(new Side({})); // 임시(나중에 방의 방향을 생성할 때 만들어지게 할 것임)
    const [gameInfo, setGameInfo] = useState(new GameInfo({type: "PnC"}));
    const [thumbnail, setThumbnail] = useState(new File([], ''));
    const [imgs, setImgs] = useState([]);
    const [addTextTrigger, setAddTextTrigger] = useState(0);
    const [addShapeTrigger, setAddShapeTrigger] = useState('');
    const [addImageFile, setAddImageFile] = useState(null);
    const [addFrameTrigger, setAddFrameTrigger] = useState(0);
    const [gameZip, setGameZip] = useState(null);

    const roomFrameStateOrigin = [220, 120, 440, 300, 170, 240, 240, 150]; // 원본
    const [edgeFrameState, setEdgeFrameState] = useState([170, 240, 240, 150]); // 외곽 모서리

    const fileInputRef = useRef(null);

    const [selectedTool, setSelectedTool] = useState('frame');
    const [selectedObject, setSelectedObject] = useState(null);

    const navigate = useNavigate();

    const handleAddFrame = () => {
        setAddFrameTrigger(Date.now());
        setSelectedTool('frame');
    };


    // 디버깅용 보정치 체크 (- 삭제예정 -)
    const editorContainerRef = useRef(null);
    const [editorOffset, setEditorOffset] = useState({ left: 0, top: 0 });

    useEffect(() => {
        if (editorContainerRef.current) {
        const rect = editorContainerRef.current.getBoundingClientRect();
        setEditorOffset({ left: rect.left, top: rect.top });
        console.log('Editor container offset:', rect.left, rect.top);
        }
    }, []);

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
        setImgs([...imgs, file]);
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

    const handleEdgeFrameState = (event, index) => {
        setEdgeFrameState(prev => {
            const newArray = [...prev];
            newArray[index] = Number(event.target.value);
            return newArray;
        });
    };

    const saveGame = () => {
        setGame(prev => (new GamePnC({
            ...prev,
            // room: [...prev.room, {...room}], // 나중에 game.room[index] 각 인덱스에 저장하게끔
            room: [{...room}],
        })));
    }

    const editOption = (event, option) => {
        const foundFabric = canvasInstance.current.getObjects().find(obj => obj === selectedObject);
        switch (option) {
            case 'name':
                foundFabric.name = event.target.value;
                break;
            case 'textAlign':
                foundFabric.textAlign = event.target.value;
                break;
            case 'textBackgroundColor':
                foundFabric.textBackgroundColor = event.target.value;
                break;
            case 'fontFamily':
                foundFabric.fontFamily = event.target.value;
                break;
            case 'fontSize':
                foundFabric.fontSize = event.target.value;
                break;
            case 'fontStyle':
                foundFabric.fontStyle = event.target.value;
                break;
            case 'fontWeight':
                foundFabric.fontWeight = event.target.value;
                break;
            case 'fill':
                foundFabric.fill = event.target.value;
                break;
            case 'strokeWidth':
                foundFabric.strokeWidth = event.target.value;
                break;
            case 'stroke':
                foundFabric.stroke = event.target.value;
                break;
            case 'strokeUniform':
                foundFabric.strokeUniform = event.target.value ? true : false;
                break;
            case 'event':
                foundFabric.event = event.target.value;
                break;
            default:
                console.warn(`${option} 잘못된 option입니다`)
                break;
        }
    }

    const moveItem = (array, fromIndex, toIndex) => {
        const item = array.splice(fromIndex, 1)[0]; // fromIndex 위치에서 요소 제거
        array.splice(toIndex, 0, item);             // toIndex 위치에 삽입
        return array;
    }

    useEffect(()=>console.log('imgs',imgs), [imgs])

    return (
        <div className='EditorPage_wrap'>
            <header className='Editor_header'>
                <h3 onClick={() => navigate(-1)}>◀ EXIT</h3>
                <img id='logo' src={logo} alt='logo' />

                <div style={{color: "white"}}>게임 불러오기<input type='file' accept='.zip' style={{backgroundColor: "red"}} onChange={(event) => setGameZip(event.target.files[0])}/></div>

                <div className='room_status_title'>
                    <p className='room_status_button'>방탈출 정보</p>
                    <label>제목: ???</label>
                </div>

                <div className='save_submit'>
                    <p className='save_button' title='저장하기'>
                        <img id='save_icon' src={save_icon} alt='save_icon' />
                    </p>
                    
                    <SaveToServer game={game} gameInfo={gameInfo} setGameInfo={setGameInfo} thumbnail={thumbnail} imgs={imgs} room={room} saveGame={saveGame}/>
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
                        {selectedObject && selectedObject.name !== 'SherLockRoomController' ? (
                            <div className='object_edit'>
                                <h2>하이</h2>
                                {selectedObject.type !== "image" && (
                                    <>
                                    name<br/>
                                    └<input type="text" value={selectedObject.name} onChange={e => editOption(e, "name")}/> <br/>
                                    fill<br/>
                                    └<input type="color" value={selectedObject.fill} onChange={e => editOption(e, "fill")}/><br/>
                                    stroke<br/>
                                    └<input type="color" value={selectedObject.stroke} onChange={e => editOption(e, "stroke")}/><br/>
                                    strokeWidth<br/>
                                    └<input type="number" value={Number(selectedObject.strokeWidth)} onChange={e => editOption(e, "strokeWidth")}/><br/>
                                    strokeUniform<br/>
                                    └<input type="checkbox" value={selectedObject.strokeUniform} onChange={e => editOption(e, "strokeUniform")}/><br/>
                                    </>
                                )}
                                {selectedObject.type == "textbox" && (
                                    <>
                                    textAlign<br/>
                                    └<select value={selectedObject.textAlign} onChange={e => editOption(e, "textAlign")}>
                                        <option value="left">left</option>
                                        <option value="center">center</option>
                                        <option value="right">right</option>
                                    </select><br/>
                                    textBackgroundColor<br/>
                                    └<input type="color" value={selectedObject.textBackgroundColor} onChange={e => editOption(e, "textBackgroundColor")}/><br/>
                                    fontFamily<br/>
                                    └<select value={selectedObject.fontFamily} onChange={e => editOption(e, "fontFamily")}>
                                        <option value="맑은 고딕">맑은 고딕</option>
                                        <option value="굴림">굴림</option>
                                        <option value="바탕">바탕</option>
                                        <option value="궁서">궁서</option>
                                        <option value="Arial">Arial</option>
                                        <option value="Arial Black">Airal Black</option>
                                        <option value="Comic Sans MS">Comic Sans MS</option>
                                        <option value="Courier New">Courier New</option>
                                        <option value="Impact">Impact</option>
                                        <option value="Tahoma">Tahoma</option>
                                        <option value="Times New Roman">Times New Roman</option>
                                    </select><br/>
                                    fontSize<br/>
                                    └<input type="number" value={Number(selectedObject.fontSize)} onChange={e => editOption(e, "fontSize")}/><br/>
                                    fontStyle<br/>
                                    └<select value={selectedObject.fontStyle} onChange={e => editOption(e, "fontStyle")}>
                                        <option value="normal">normal</option>
                                        <option value="italic">italic</option>
                                        <option value="bold">bold</option>
                                    </select><br/>
                                    fontWeight<br/>
                                    └<select value={selectedObject.fontWeight} onChange={e => editOption(e, "fontWeight")}>
                                        <option value="normal">normal</option>
                                        <option value="bold">bold</option>
                                        <option value="lighter">lighter</option>
                                    </select><br/>
                                    </>
                                )}
                                <button onClick={handleAddEvent}>event</button>
                            </div>
                        ) : (
                            <>
                                {selectedTool === 'frame' && (
                                    <div className='frame_fine_tuning'>
                                        top: <input id="roomFrame0" type="range" min={120} max={800} value={edgeFrameState[0]} step={1} onChange={event => handleEdgeFrameState(event, 0)}/> {edgeFrameState[0]} <br />
                                        left: <input id="roomFrame0" type="range" min={220} max={800} value={edgeFrameState[1]} step={1} onChange={event => handleEdgeFrameState(event, 1)}/> {edgeFrameState[1]} <br />
                                        right: <input id="roomFrame0" type="range" min={220} max={800} value={edgeFrameState[2]} step={1} onChange={event => handleEdgeFrameState(event, 2)}/> {edgeFrameState[2]} <br />
                                        bottom: <input id="roomFrame0" type="range" min={110} max={800} value={edgeFrameState[3]} step={1} onChange={event => handleEdgeFrameState(event, 3)}/> {edgeFrameState[3]} <br />
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
                            </>
                        )}
                    </div>
                </div>

                <div className='Editor_screen'>
                    <div className='screen_area'>
                        <div className='screen'>
                            <Editor
                                addTextTrigger={addTextTrigger}
                                addShapeTrigger={addShapeTrigger}
                                addImageFile={addImageFile}
                                addFrameTrigger={addFrameTrigger} 
                                onObjectSelect={setSelectedObject}
                                edgeFrameState={edgeFrameState}
                                editorOffset={editorOffset}
                                setEdgeFrameState={setEdgeFrameState}
                                saveTool={{game, setGame, room, setRoom, side, setSide, imgs, setImgs}}
                                gameZip={gameZip} setGameZip={setGameZip}
                                selectedTool={selectedTool}
                                canvases={{canvasRef, canvasInstance}}
                            />
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