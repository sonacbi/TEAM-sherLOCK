import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import Editor from '../components/Editor/Editor';
import SaveToServer from '../components/Editor/SaveToServer';
import EditObjOptions from '../components/Editor/EditObjOptions';
import RoomInfo from '../components/RoomInfo/RoomInfo';

import { GamePnC, Room, Side } from '../../modules/editor/gamePnC';
import { GameInfo } from '../../modules/game-modules';
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
import img_none_icon from '../assets/images/RoomInfo/Room_thumbnail_basic_img.png';
import basic_frame_img from '../assets/images/EditorPage_img/basic_frame_img.png';
import edge_frame_img from '../assets/images/EditorPage_img/edge_frame_img.png';
import corridor_frame_img from '../assets/images/EditorPage_img/corridor_frame_img.png';
import wall_left_img from '../assets/images/EditorPage_img/wall_left_img.png';
import wall_right_img from '../assets/images/EditorPage_img/wall_right_img.png';
import wall_center_img from '../assets/images/EditorPage_img/wall_center_img.png';
import wall_bottom_img from '../assets/images/EditorPage_img/wall_bottom_img.png';
import wall_top_img from '../assets/images/EditorPage_img/wall_top_img.png';
import frame_trash from '../assets/images/EditorPage_img/trash.png';


function EditorPage() {
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [game, setGame] = useState(new GamePnC({}));
    const [room, setRoom] = useState(new Room({}));
    const [currentRoom, setCurrentRoom] = useState(0);
    const [currentSide, setCurrentSide] = useState(0);
    const [sideImgSrcs, setSideImgSrcs] = useState([['']]);
    const [gameInfo, setGameInfo] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [imgs, setImgs] = useState([]);
    const [imageSrcs, setImageSrcs] = useState([]);
    const [storedFabrics, setStoredFabrics] = useState([]);
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

    const [showRoomInfo, setShowRoomInfo] = useState(true); // 처음에 무조건 보이게
    const roomInfoRef = useRef(null);

    const [selectedFrameType, setSelectedFrameType] = useState(null);

    const handleFrameTypeClick = (type) => {
        setSelectedFrameType(type);
        setAddFrameTrigger({ modified: Date.now(), type });

        // 3초 후 선택 해제
        setTimeout(() => {
            setSelectedFrameType(null);
        }, 500);
    };

    const [activeWall, setActiveWall] = useState(null);

    const handleWallClick = (wall) => {
        setActiveWall(prev => (prev === wall ? null : wall));
    };

    const handleAddFrame = () => {
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

    // 공통 처리 함수
    const processImageFile = (file) => {
        if (!file || !file.type.startsWith('image/')) return;

        setImgs(prev => {
            const isDuplicate = prev.some(f => 
                f.name === file.name &&
                f.size === file.size &&
                f.type === file.type
            );
            if (isDuplicate) return prev;
            return [...prev, file];
        });
        // ⚠️ 여기서 바로 비우면 안 됨
        setAddImageFile(file);

        // 같은 파일 다시 선택 가능하게 하기 → 자식 컴퍼넌트로 이동
        // setTimeout(() => setAddImageFile(null), 0);
    };
    
    // 버튼 클릭 -> input 열기
    const handleAddImageFile = () => {
        fileInputRef.current.click();
    };

    // input에서 파일 선택
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            processImageFile(file);
        }

        // ✅ 핵심: input value를 수동으로 비워서 같은 파일도 연속 선택 가능하게 함
        e.target.value = '';
    };

    // 드래그 앤 드롭 : ✅ 버튼과 완전히 동일하게 1개씩 처리
    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const imageFile = Array.from(files).find(file => file.type.startsWith('image/'));
            if (imageFile) {
                processImageFile(imageFile);
            }
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
        game.room[currentRoom].side[currentSide].frame = null;
    }

    useEffect(()=>console.log('imgs',imgs), [imgs])

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

    const toggleRoomInfo = () => {
        setShowRoomInfo(prev => !prev);
    };

    const EdgeFramePage = () => {
        const roomController = canvasInstance.current?.getObjects().find(obj => obj.name === 'SherLockRoomController'); 
        const edge = game.room[currentRoom].side[currentSide]?.frame?.edge;

        const handleEdge = (value, index) => {
            roomController.edge[index] = value;
            setGame(prev => {
                const newData = new GamePnC(prev);
                newData.room[currentRoom].side[currentSide].frame.edge[index] = value;
                return newData;
            })
        }

        return(
            <div className='frame_fine_tuning'>
                {roomController && edge ?
                    (<>
                        <div className='frame_wall_header'>
                            <label>프레임 조정</label>

                            <img id='frame_trash' src={frame_trash} alt='frame_trash' onClick={removeFrame} />
                        </div>

                        <div className='frame_wall_wrap'>
                            <div 
                                className={`wall_top ${activeWall === 'top' ? 'active' : ''}`}
                                onClick={() => handleWallClick('top')}
                            >
                                <img id='wall_top_img' src={wall_top_img} alt='wall_top_img' />
                                <p>top</p>
                            </div>

                            <div 
                                className={`wall_left ${activeWall === 'left' ? 'active' : ''}`}
                                onClick={() => handleWallClick('left')}
                            >
                                <img id='wall_left_img' src={wall_left_img} alt='wall_left_img' />
                                <p>left</p>
                            </div>

                            <div 
                                className={`wall_center ${activeWall === 'center' ? 'active' : ''}`}
                                onClick={() => handleWallClick('center')}
                            >
                                <img id='wall_center_img' src={wall_center_img} alt='wall_center_img' />
                                <p>center</p>
                            </div>

                            <div 
                                className={`wall_right ${activeWall === 'right' ? 'active' : ''}`}
                                onClick={() => handleWallClick('right')}
                            >
                                <img id='wall_right_img' src={wall_right_img} alt='wall_right_img' />
                                <p>right</p>
                            </div>

                            <div 
                                className={`wall_bottom ${activeWall === 'bottom' ? 'active' : ''}`}
                                onClick={() => handleWallClick('bottom')}
                            >
                                <img id='wall_bottom_img' src={wall_bottom_img} alt='wall_bottom_img' />
                                <p>bottom</p>
                            </div>
                        </div>

                        top: <input type="range" min={120} max={800} value={edge[0]} step={1} onChange={e => handleEdge(e.target.valueAsNumber, 0)}/> {edge[0]} <br />
                        left: <input type="range" min={220} max={800} value={edge[1]} step={1} onChange={e => handleEdge(e.target.valueAsNumber, 1)}/> {edge[1]} <br />
                        right: <input type="range" min={220} max={800} value={edge[2]} step={1} onChange={e => handleEdge(e.target.valueAsNumber, 2)}/> {edge[2]} <br />
                        bottom: <input type="range" min={110} max={800} value={edge[3]} step={1} onChange={e => handleEdge(e.target.valueAsNumber, 3)}/> {edge[3]} <br />
                    </>)
                    :
                    (<>
                        <label>프레임 구조</label>

                        <div className='frame_type_wrap'>
                            <div className={`basic_frame ${selectedFrameType === 'basic' ? 'selected' : ''}`} onClick={() => handleFrameTypeClick('basic')}>
                                <img id='basic_frame_img' src={basic_frame_img} alt='basic_frame_img' />

                                <div>
                                    <p>기본 프레임</p>
                                </div>
                            </div>

                            <div className={`edge_frame ${selectedFrameType === 'edge' ? 'selected' : ''}`} onClick={() => handleFrameTypeClick('edge')}>
                                <img id='edge_frame_img' src={edge_frame_img} alt='edge_frame_img' />

                                <div>
                                    <p>모서리 프레임</p>
                                </div>
                            </div>

                            <div className={`corridor_frame ${selectedFrameType === 'corridor' ? 'selected' : ''}`} onClick={() => handleFrameTypeClick('corridor')}>
                                <img id='corridor_frame_img' src={corridor_frame_img} alt='corridor_frame_img' />

                                <div>
                                    <p>복도 프레임</p>
                                </div>
                            </div>    
                        </div>
                    </>)
                }
            </div>
        )
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                showRoomInfo &&
                roomInfoRef.current &&
                !roomInfoRef.current.contains(event.target)
            ) {
                setShowRoomInfo(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showRoomInfo]);

    return (
        <>
            <div className='EditorPage_wrap'>
                <header className='Editor_header'>
                    <h3 onClick={() => navigate(-1)}>◀ EXIT</h3>
                    <img id='logo' src={logo} alt='logo' />

                    {/* <div style={{color: "white"}}>게임 불러오기<input type='file' accept='.zip' style={{backgroundColor: "red"}} onChange={(event) => setGameZip(event.target.files[0])}/></div> */}

                    <div className='room_status_title' ref={roomInfoRef}>
                        <p className='room_status_button' onClick={toggleRoomInfo}>방탈출 정보</p>
                        {showRoomInfo && <RoomInfo gameInfo={gameInfo} setGameInfo={setGameInfo} thumbnail={thumbnail} setThumbnail={setThumbnail}/>}
                        <label>제목: ???</label>
                    </div>

                    <SaveToServer game={game} gameInfo={gameInfo} setGameInfo={setGameInfo} thumbnail={thumbnail} imgs={imgs}/>
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
                                <EditObjOptions canvasInstance={canvasInstance} selectedObject={selectedObject} selectedTool={selectedTool} setImgs={setImgs} storedFabrics={storedFabrics} setStoredFabrics={setStoredFabrics}/>
                            ) : (
                                <>
                                    {selectedTool === 'frame' && (
                                        <EdgeFramePage/>
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
                                            <label>사진 목록</label>

                                            <div className='img_list_wrap'>
                                                <div className={`img_list ${imageSrcs.length === 0 ? 'flex' : 'grid'}`}>
                                                    {imageSrcs.length === 0 ? (
                                                        <div className='img_none'>
                                                            <img id='img_none_icon' src={img_none_icon} alt='img_none_icon' />
                                                            <p>* 아직 추가된 이미지가 없습니다.</p>
                                                        </div>
                                                    ) : (
                                                        imageSrcs.map((src, idx) => (
                                                            <div key={idx} className='img_box'>
                                                                <img src={src} alt={`img-${idx}`} />
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div className='picture_addButton' onClick={handleAddImageFile}>
                                                <p>
                                                    사진 추가
                                                </p>
                                                <input
                                                    type='file'
                                                    accept='image/*'
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                />
                                            </div>
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

                    <Editor
                        handleDrop={handleDrop}
                        addTextTrigger={addTextTrigger}
                        addShapeTrigger={addShapeTrigger}
                        setAddImageFile={setAddImageFile}
                        addImageFile={addImageFile}
                        addFrameTrigger={addFrameTrigger} 
                        onObjectSelect={setSelectedObject}
                        edgeFrameState={edgeFrameState}
                        editorOffset={editorOffset}
                        setEdgeFrameState={setEdgeFrameState}
                        saveTool={{game, setGame, room, setRoom, currentRoom, setCurrentRoom, currentSide, setCurrentSide, sideImgSrcs, setSideImgSrcs, imgs, setImgs}}
                        gameZip={gameZip} setGameZip={setGameZip}
                        selectedTool={selectedTool}
                        canvases={{canvasRef, canvasInstance}}
                    />
                </div>
            </div>
        </>
    );
}

export default EditorPage;