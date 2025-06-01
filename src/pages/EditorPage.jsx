import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Editor from '../components/Editor/Editor';
import SaveToServer from '../components/Editor/SaveToServer';
import EditObjOptions from '../components/Editor/EditObjOptions';
import RoomInfo from '../components/RoomInfo/RoomInfo';

import { GamePnC, Room, Side } from '../../modules/editor/gamePnC';
import { GameInfo } from '../../modules/game-modules';
import { loadCanvas } from '../../modules/editor/handleGame';
import '../styles/EditorPage.css';

import logo from '../assets/images/logo/footer_logo.png'
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
    const [currentRoom, setCurrentRoom] = useState(0);
    const [currentSide, setCurrentSide] = useState(0);
    const [sideImgSrcs, setSideImgSrcs] = useState([['']]);
    const [gameInfo, setGameInfo] = useState(new GameInfo({type: "PnC"}));
    const [thumbnail, setThumbnail] = useState(new File([], ''));
    const [imgs, setImgs] = useState([]);
    const [imageSrcs, setImageSrcs] = useState([]);
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
        setSelectedTool('picture');
    };
    
    const handleAddImageFile = () => {
        fileInputRef.current.click();
    }

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

    const removeFrame = () => {
        const target1 = canvasInstance.current.getObjects().find(obj => obj.name === 'SherLockRoomFrame');
        const target2 = canvasInstance.current.getObjects().find(obj => obj.name === 'SherLockRoomController')
        if (target1) canvasInstance.current.remove(target1);
        if (target2) canvasInstance.current.remove(target2);
    }

    const handleAddGameRoom = () => {
        setGame(prev => (new GamePnC({
            ...prev, room: [...prev.room, new Room({})]
        })));
        setSideImgSrcs(prev => {
            const newData = [ ...prev ];
            newData.push([]);
            return newData;
        })
    }

    const handleAddGameSide = () => {
        setRoom(prev => ({
            ...prev, side: [...prev.side, new Side({})]
        }));
    }

    const handleCurrentRoom = (roomIndex) => {
        setCurrentRoom(roomIndex);
    }

    const handleCurrentSide = (roomIndex) => {
        setCurrentSide(roomIndex);
    }

    const handleChangeRoomName = (name) => {
        setGame(prev => {
            const newData = { ...prev };
            newData.room[currentRoom].name = name;
            return new GamePnC(newData);
        })
    }

    const handleChangeSideName = (name) => {
        setGame(prev => {
            const newData = { ...prev };
            newData.room[currentRoom].side[currentSide].name = name;
            return new GamePnC(newData);
        })
    }

    useEffect(()=>console.log('imgs',imgs), [imgs])
    useEffect(()=>console.log('sideImgSrcs',sideImgSrcs), [sideImgSrcs])

    useEffect(() => {
        const promises = imgs.map((file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        });

        Promise.all(promises)
        .then((results) => setImageSrcs(results))
        .catch((err) => console.error('이미지 읽기 실패', err));
    }, [imgs]);

    useEffect(() => {
        setGame(prev => {
            if (prev.room[currentRoom] === room) return prev; // 변화 없으면 그대로 반환
            const newGameData = { ...prev };
            newGameData.room[currentRoom] = room;
            return new GamePnC(newGameData);
        });
    }, [room]);
    
    useEffect(() => {
        if (game.room[currentRoom] && game.room[currentRoom] !== room) {
            setRoom(game.room[currentRoom]);
        }
    }, [currentRoom, game]);

    return (
        <>
            <div className='EditorPage_wrap'>
                <header className='Editor_header'>
                    <h3 onClick={() => navigate(-1)}>◀ EXIT</h3>
                    <img id='logo' src={logo} alt='logo' />

                    <div style={{color: "white"}}>게임 불러오기<input type='file' accept='.zip' style={{backgroundColor: "red"}} onChange={(event) => setGameZip(event.target.files[0])}/></div>

                    <div className='room_status_title'>
                        <p className='room_status_button'>방탈출 정보</p>
                        {/* <RoomInfo /> */}
                        <label>제목: ???</label>
                    </div>

                    <SaveToServer game={game} gameInfo={gameInfo} setGameInfo={setGameInfo} thumbnail={thumbnail} imgs={imgs} canvases={{canvasRef, canvasInstance, setRoom, currentRoom, setSide, currentSide, setSideImgSrcs}}/>
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
                                <EditObjOptions canvasInstance={canvasInstance} selectedObject={selectedObject} selectedTool={selectedTool}/>
                            ) : (
                                <>
                                    {selectedTool === 'frame' && (
                                        <div className='frame_fine_tuning'>
                                            top: <input id="roomFrame0" type="range" min={120} max={800} value={edgeFrameState[0]} step={1} onChange={event => handleEdgeFrameState(event, 0)}/> {edgeFrameState[0]} <br />
                                            left: <input id="roomFrame0" type="range" min={220} max={800} value={edgeFrameState[1]} step={1} onChange={event => handleEdgeFrameState(event, 1)}/> {edgeFrameState[1]} <br />
                                            right: <input id="roomFrame0" type="range" min={220} max={800} value={edgeFrameState[2]} step={1} onChange={event => handleEdgeFrameState(event, 2)}/> {edgeFrameState[2]} <br />
                                            bottom: <input id="roomFrame0" type="range" min={110} max={800} value={edgeFrameState[3]} step={1} onChange={event => handleEdgeFrameState(event, 3)}/> {edgeFrameState[3]} <br />
                                            <button onClick={removeFrame}>프레임 삭제</button>
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
                                        <div className='picture_fine_tuning' onClick={handleAddImageFile}>
                                            <h2>사진 세부조정</h2>
                                            <div style={{backgroundColor: "green"}}>
                                                <p>
                                                    나는 사진 추가하는 버튼이야
                                                </p>
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
                                            {imageSrcs.map((src, idx) => (
                                                <img key={idx} src={src} alt={`img-${idx}`} />
                                            ))}
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

                        {/*
                        태그 구조
                        div.room_area
                          ┝div.room * n
                          │ ┝h2 방 번호
                          │ ┝input 방 이름
                          │ └div.side_area
                          │   ┝div.side * n
                          │   │ ┝h4 방향 번호
                          │   │ └input 방향 이름
                          │   └button 방향 추가
                          └button 방 추가
                        */}
                        <div className='room_area'>
                            {game.room.map((roomData, roomIndex) => {
                                return (
                                    <div className='room' key={roomIndex} onClick={() => handleCurrentRoom(roomIndex)}>
                                        <h2>{roomIndex}</h2>
                                        <input type="text" value={roomData.name || ''} onChange={(e) => handleChangeRoomName(e.target.value)} placeholder='방의 이름'/>
                                            {roomIndex == currentRoom && (
                                                <div className='side_area'>
                                                    {room.side.map((sideData, sideIndex) => {
                                                        return(
                                                            <div className='side' key={sideIndex} onClick={() => handleCurrentSide(sideIndex)}>
                                                                {sideImgSrcs[currentRoom][sideIndex] && <img src={sideImgSrcs[currentRoom][sideIndex]} width={110} height={65} /*onClick={loadCanvas(canvasInstance.current)}*//>}
                                                                <h4>{sideIndex}</h4>
                                                                <input type="text" value={sideData.name || ''} onChange={(e) => handleChangeSideName(e.target.value)} placeholder='방향의 이름'/>
                                                                {}
                                                            </div>
                                                        )
                                                    })}
                                                    <button onClick={handleAddGameSide}>방향 추가</button>
                                                </div>
                                            )}
                                    </div>
                                )
                            })}
                            <button onClick={handleAddGameRoom}>방 추가</button>
                            <button onClick={() =>console.log('game',game)}>게임</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditorPage;