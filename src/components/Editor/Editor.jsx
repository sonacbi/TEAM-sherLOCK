import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

import './Editor.css';

import { createRoomFrame } from '../../../modules/handlePolygon';
import { GamePnC, Room, Side } from '../../../modules/editor/gamePnC';
import { handleSide, loadCanvas, loadGame, loadGameZip } from '../../../modules/editor/handleGame';
import WebGLPerspectiveComponent from './PerspectiveFrame/WebGLPerspectiveComponent';
import { getShapeByType } from './getShapeByType';
import { useDeleteKeyHandler, useCanvasZoom, useCanvasClickDeselect } from './useCanvasHandlers';
import { useWallHoverHandler } from './PerspectiveFrame/useWallHoverhandler';
import { getWallsFromCanvas, getWallVertices } from './PerspectiveFrame/perspectiveBackground';
import useSyncPerspective from './PerspectiveFrame/useSyncPerspective';

function Editor({ handleDrop, addTextTrigger, addShapeTrigger, addImageFile, addFrameTrigger, edgeFrameState, setEdgeFrameState, saveTool, gameZip, onObjectSelect, selectedTool, canvases }) {
    const {game, setGame, room, setRoom, side, setSide, currentRoom, setCurrentRoom, currentSide, setCurrentSide, sideImgSrcs, setSideImgSrcs, imgs, setImgs} = saveTool;
    const {canvasRef, canvasInstance} = canvases;
    const [isReady, setIsReady] = useState(false);
    const [angle, setAngle] = useState(0);
    const [position, setPosition] = useState([220, 120]);
    const [size, setSize] = useState([position[0] + 440, position[1] + 300]);
    const isDragging = useRef(false); // React 훅에서 드래그 상태 저장용 useRef
    const [isReadyToLoad, setIsReadyToLoad] = useState(false);

    // 프레임 원근법 배경 왜곡 디버깅 코드 + 상태 관리 코드 ------------ (section 1) (정다정)
    //디버깅용
    const containerRef = useRef(null);

    // 3D 배경 처리용
    const hoveredWallLocal = useRef(null); // 현재 마우스가 호버중인 벽 객체 저장 (이벤트 핸들러 전용)
    const originalStyles = useRef(new Map()); // 호버된 벽의 원래 스타일을 저장하는 Map (객체별)
    // 최종 저장된 이미지와 꼭짓점
    const [perspective, setPerspective] = useState({ front: {}, left: {}, right: {}, top: {}, bottom: {}, });
    // perspective 항상 최신값을 유지하도록 관리
    const perspectiveRef = useRef(perspective);
    useEffect(() => { perspectiveRef.current = perspective; }, [perspective]);
    // 현재 호버된 벽 객체 상태
    const [hoveredWall, setHoveredWall] = useState(null);
    // 현재 호버된 벽의 꼭지점 좌표 (WebGL 컴포넌트 전달용)
    const [hoveredWallVertices, setHoveredWallVertices] = useState([]);

    const [selectedSide, setSelectedSide] = useState({ roomIndex: null, sideIndex: null });

    // 1. hoveredWallVertices가 바뀔 때 perspective 상태도 업데이트하는 효과 추가
    useEffect(() => {
    if (!hoveredWall) return;

    setPerspective(prev => ({
        ...prev,
        [hoveredWall.wallType]: {
        ...prev[hoveredWall.wallType],
        vertices: hoveredWallVertices,
        imageUrl: prev[hoveredWall.wallType]?.imageUrl || ''
        }
    }));
    }, [hoveredWall, hoveredWallVertices]);

    // perspectiveWalls를 벽 객체 배열로 관리
    const perspectiveWalls = React.useMemo(() => {
        return Object.entries(perspective)
            .map(([wallType, data]) => {
            if (!data) return null;
            // hoveredWall인지 판단하여 꼭짓점 교체
            if (hoveredWall && hoveredWall.wallType === wallType && hoveredWallVertices.length === 4) {
                return {
                wallType,
                imageUrl: data.imageUrl,  // imageUrl 꼭 포함
                ...data,
                vertices: hoveredWallVertices,
                };
            }
            return { wallType, ...data };
            })
            .filter(Boolean);
    }, [perspective, hoveredWall, hoveredWallVertices]);

    // hoveredWall이 있을 때 vertices를 hoveredWallVertices로 대체해서 넘기도록 items 생성
    const items = React.useMemo(() => {
    const result = perspectiveWalls.map(wall => {
            if (hoveredWall && hoveredWall.wallType === wall.wallType) {
                return {
                ...wall,
                vertices: hoveredWallVertices.length === 4 ? hoveredWallVertices : wall.vertices,
                imageUrl: perspective[wall.wallType]?.imageUrl ?? '',
                };
            }
            return wall;
        });
        if (process.env.NODE_ENV === 'development' && hoveredWall) {
            console.log('[useMemo] items:', result);
        }
        return result;
    }, [perspectiveWalls, hoveredWall, hoveredWallVertices]);

    // -------------------------------------------------------------- (section 1) (정다정)

    // 공통 스타일 ---------------------------------------------------(section 2) ?
    const controlStyle = {
        transparentCorners: false,
        borderColor: '#A9DB78',
        editingBorderColor: '#A9DB78',
        selectionColor: 'rgba(128, 128, 128, 0.3)',
        cornerStrokeColor: '#A9DB78',
        cornerColor: 'white',
        cornerStyle: 'circle',
        borderScaleFactor: 2,
        gameEvent: [],
    };
    // ---------------------------------------------------------------(section 2) ?

    // 프레임 설정 기본값 세팅 ---------------------------------------(section 3) (노은성)
    const [roomController, setRoomController] = useState(new fabric.Rect({
        ...controlStyle,
        left: 220,
        top: 120,
        fill: 'rgba(255, 0, 0, 0.2)',
        strokeWidth: 2,
        stroke: 'red',
        name: "SherLockRoomController",
    }));
    useEffect(()=> {
        roomController.width = roomController.left + 440;
        roomController.height = roomController.top + 300;
        roomController.on('rotating', () => {
            setAngle(roomController.angle);
            setPosition([roomController.left, roomController.top]);
        });
        roomController.on('moving', () => {
            setPosition([roomController.left, roomController.top]);
            setSize([roomController.getScaledWidth(), roomController.getScaledHeight()]);
        });
        roomController.on('scaling', () => {
            setPosition([roomController.left, roomController.top]);
            setSize([roomController.getScaledWidth(), roomController.getScaledHeight()]);
        });
    }, [])
    // ---------------------------------------------------------------(section 3) (노은성)
    // 캔버스 랜더링 기본값 세팅 -------------------------------------(section 4) ?
    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1100,
            height: 650,
            backgroundColor: 'transparent',
            selection: true,
            selectionColor: 'rgba(169, 219, 120, 0.3)',
            selectionBorderColor: '#A9DB78',
        });
        canvasInstance.current = canvas;

        // 초기 textbox 추가
        const textbox = new fabric.Textbox('텍스트를 입력하세요.', {
            ...controlStyle,
            fontSize: 50,
            fill: '#333333',
            width: 450,
            editable: true,
        });

        textbox.setControlsVisibility({ mt: false, mb: false });
        canvas.centerObject(textbox);
        textbox.setCoords();
        canvas.add(textbox);
        canvas.renderAll();
        // ---------------------------------------------------------------(section 4) 
        //                           -------------------------------------(section 5) 
        canvas.on('selection:created', (e) => {
           onObjectSelect(e.selected[0]); // 선택된 객체 전달
        });

        canvas.on('selection:updated', (e) => {
            onObjectSelect(e.selected[0]);
        });

        canvas.on('selection:cleared', () => {
            onObjectSelect(null); // 선택 해제 시 null
        });

        // 비율 유지하면서 크기 조절
        textbox.on('scaling', () => {
            const scaleX = textbox.scaleX;
            const scaleY = textbox.scaleY;
            textbox.set({
                scaleX: 1,
                scaleY: 1,
                fontSize: textbox.fontSize * scaleY,
                width: textbox.width * scaleX,
                height: textbox.height * scaleY,
            });
            canvas.renderAll();
        });

        saveCanvasToSide();
        setIsReady(true);
        return () => canvas.dispose();
    }, []);
    //                           -------------------------------------(section 5) 
    // 캔버스 내 객체가 생성/변경/삭제되면 저장-----------------------(section) (노은성)
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        canvas.on('object:added', saveCanvasToSide);
        canvas.on('object:modified', saveCanvasToSide);
        canvas.on('object:removed', saveCanvasToSide);

        // cleanup
        return () => {
            canvas.off('object:added', saveCanvasToSide);
            canvas.off('object:modified', saveCanvasToSide);
            canvas.off('object:removed', saveCanvasToSide);
        };
    }, [canvasInstance.current, currentRoom, currentSide]);
    // ---------------------------------------------------------------(section)
    // 랜더링 준비되면 추가버튼 활성화 -------------------------------(section 6) 
    useEffect(() => {
        if (isReady) addTextBox();
    }, [addTextTrigger]);

    useEffect(() => {
        if (isReady && addShapeTrigger) {
            addShape(addShapeTrigger);
        }
    }, [addShapeTrigger]);

    useEffect(() => {
        if (isReady) {
            addFrame();
        }
    }, [addFrameTrigger, angle, position, size, edgeFrameState]);
    //                           -------------------------------------(section 6)

    // 텍스트 추가  --------------------------------------------------(section 7)
    const addTextBox = () => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const textbox = new fabric.Textbox('새 텍스트', {
            ...controlStyle,
            fontSize: 40,
            fill: '#333333',
            width: 160,
            editable: true,
        });

        textbox.setControlsVisibility({ mt: false, mb: false });
        canvas.centerObject(textbox);
        textbox.setCoords();
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        canvas.renderAll();

        textbox.on('scaling', () => {
            const scaleX = textbox.scaleX;
            const scaleY = textbox.scaleY;
            textbox.set({
                scaleX: 1,
                scaleY: 1,
                fontSize: textbox.fontSize * scaleY,
                width: textbox.width * scaleX,
                height: textbox.height * scaleY,
            });
            canvas.renderAll();
        });
    };
    // ---------------------------------------------------------------(section 7)
    // 도형 추가  ----------------------------------------------------(section 8)
    const addShape = (shapeType) => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const shape = getShapeByType(shapeType, controlStyle);
        if (!shape) return;

        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
    };
    // ---------------------------------------------------------------(section 8)
    // 프레임 추가  --------------------------------------------------(section 9)
    const addFrame = () => {
        const canvas = canvasInstance.current;
        if (!canvas) return;
        
        const target = canvas.getObjects().find(obj => obj.name === 'SherLockRoomFrame');
        if (target) canvas.remove(target);
        
        const roomFrame = createRoomFrame(
            ...position,
            ...size,
            ...edgeFrameState,
            angle
        );

        canvas.add(roomFrame);
        if (!canvas.getObjects().find(obj => obj.name === 'SherLockRoomController')) {
            canvas.add(roomController);
            canvas.setActiveObject(roomController);
            canvas.sendObjectToBack(roomController);
        }

        const result = perspectiveWalls.map(wall => {
            if (hoveredWall && hoveredWall.wallType === wall.wallType) {
                return {
                ...wall,
                vertices: hoveredWallVertices.length === 4 ? hoveredWallVertices : wall.vertices,
                imageUrl: perspective[wall.wallType]?.imageUrl ?? '',
                };
            }
            return wall;
        });
        const frameObjects = roomFrame.getObjects?.() ?? [];
        frameObjects.forEach(obj => {
            if (result.find(data => data.imageUrl && data.wallType === obj.wallType)) {
                obj.set({ fill: 'rgba(255,255,255,0)', stroke: 'rgba(255,255,255,0)' });
            }
        });
        if (result.find(data => data.imageUrl && data.wallType === 'front' )) {
            roomController.set({ fill: 'rgba(255,255,255,0)', stroke: 'rgba(255,255,255,0)' });
        }
        
        canvas.sendObjectToBack(roomFrame);
        
        canvas.renderAll();
    };

    const handleAddGameRoom = () => {
        setGame(prev => (new GamePnC({
            ...prev, room: [...prev.room, new Room({})]
        })));
        setSideImgSrcs(prev => [...prev, ['']]);
    }

    const handleAddGameSide = () => {
        setRoom(prev => ({
            ...prev, side: [...prev.side, new Side({})]
        }));
    }

    const handleDeleteGameRoom = (roomSide) => {
        if (game.room.length <= 1) return; // 최소 1개는 유지
        setGame(prev => {
            const newRooms = [...prev.room];
            newRooms.splice(roomSide, 1); // 현재 방 삭제
            return new GamePnC({ ...prev, room: newRooms });
        });
        setSideImgSrcs(prev => {
            const newImgs = [...prev];
            newImgs.splice(roomSide, 1);
            return newImgs;
        });
        // 인덱스 조정
        setCurrentRoom(prev => Math.max(0, prev - 1));
    }

    const handleDeleteGameSide = () => {
        if (room.side.length <= 1) return;

        const deletedIndex = currentSide;
        const newLength = room.side.length - 1;

        // 삭제 후 선택할 인덱스 계산
        const newSideIndex = deletedIndex >= newLength ? newLength - 1 : deletedIndex;

        setRoom(prev => {
            const newSides = [...prev.side];
            newSides.splice(deletedIndex, 1);
            return { ...prev, side: newSides };
        });

        setSideImgSrcs(prev => {
            const newImgs = [...prev];
            if (!newImgs[currentRoom]) return prev;
            const updatedSides = [...newImgs[currentRoom]];
            updatedSides.splice(deletedIndex, 1);
            newImgs[currentRoom] = updatedSides;
            return newImgs;
        });

        setSelectedSide(prev => {
            if (prev.roomIndex !== currentRoom) return prev;

            if (prev.sideIndex === deletedIndex) {
                return { roomIndex: currentRoom, sideIndex: newSideIndex };
            }
            return prev;
        });

        setCurrentSide(newSideIndex);
    };

    const handleCurrentRoom = (roomIndex) => {
        setCurrentRoom(roomIndex);

        setSelectedSides((prev) => {
            const updated = { ...prev };
            Object.keys(updated).forEach(key => {
                if (parseInt(key) !== roomIndex) {
                    delete updated[key];
                }
            });
            return updated;
        });
    }

    // const handleCurrentSide = (sideIndex, cb) => {
    //     setCurrentSide(sideIndex);
    //     setTimeout(() => {
    //         cb?.();
    //     }, 100)
    // }
    const handleCurrentSide = (sideIndex) => {
        setCurrentSide(sideIndex);

        setSelectedSide({ roomIndex: currentRoom, sideIndex });
    }

    const handleChangeRoomName = (roomIndex, name) => {
        setGame(prev => {
            const newData = { ...prev };
            newData.room[roomIndex].name = name;
            return new GamePnC(newData);
        })
    }

    const handleChangeSideName = (roomIndex, sideIndex, name) => {
        setGame(prev => {
            const newData = { ...prev };
            newData.room[roomIndex].side[sideIndex].name = name;
            return new GamePnC(newData);
        })
    }

    const saveCanvasToSide = () => {
        setTimeout(() => {
            const updatedFabric = handleSide(canvasInstance.current, setSide);
            setRoom(prev => {
                const newData = new Room({ ...prev })
                newData.side[currentSide].fabric = updatedFabric;
                return newData;
            })
            setSideImgSrcs(prev => {
                const newData = [ ...prev ];
                newData[currentRoom][currentSide] = canvasRef.current.toDataURL({
                    format: 'jpeg',
                    quality: 0.1,
                });
                return newData;
            });
        }, 100)
    }

    useEffect(()=>console.log('sideImgSrcs',sideImgSrcs), [sideImgSrcs])

    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const roomController = canvas.getObjects().find(obj => obj.name === 'SherLockRoomController');
        if (!roomController) return;

        // 'frame' 선택일 때만 selectable 활성화
        roomController.selectable = selectedTool === 'frame';
        
        if (selectedTool === 'frame') {
            roomController.hoverCursor = 'move';
            roomController.moveCursor = 'move';
        } else {
            roomController.hoverCursor = 'default';
            roomController.moveCursor = 'default';
        }

        canvas.renderAll();
    }, [selectedTool]);

    useEffect(() => {
        if (isReadyToLoad && game) {
            loadGame(game, imgs, canvasInstance.current, saveCanvasToSide, setCurrentRoom, setCurrentSide, setSideImgSrcs, controlStyle, roomController, setPosition, setSize, setAngle, setEdgeFrameState, addFrame);
            setIsReadyToLoad(false);
        }
    }, [isReadyToLoad, game]);
    useEffect(() => {
        if (isReady && gameZip) {
            loadGameZip(gameZip, setGame, setImgs, setIsReadyToLoad);
        }
    }, [gameZip]);
    // ☑️ 오타있음 --------------------------------------------------(section 10)
    // 이미지 추가 ---------------------------------------------------(section 11)
    useEffect(() => {
        if (isReady && addImageFile) {
            if (!addImageFile.type.startsWith('image/')) {
                alert('이미지 파일만 업로드할 수 있습니다.');
                return;
            }

            const reader = new FileReader();

            reader.onload = function (e) {
                if (!canvasInstance.current) {
                    return;
                }

                const imgElement = new Image();
                imgElement.src = e.target.result;

                imgElement.onload = () => {
                    const MAX_WIDTH = 800;  // 최대 너비
                    const MAX_HEIGHT = 600; // 최대 높이
                    // const warpedCanvas = warpImageToTrapezoid(imgElement, 40);

                    let { width, height } = imgElement;

                    // 이미지가 최대 크기보다 크면 비율에 맞게 축소
                    if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                        const widthRatio = MAX_WIDTH / width;
                        const heightRatio = MAX_HEIGHT / height;
                        const ratio = Math.min(widthRatio, heightRatio);

                        width = width * ratio;
                        height = height * ratio;
                    }

                    // const fabricImage = new fabric.Image(warpedCanvas, {
                    const fabricImage = new fabric.Image(imgElement, {
                        ...controlStyle,
                        left: 150,
                        top: 150,
                        scaleX: width / imgElement.width,
                        scaleY: height / imgElement.height,
                        name: addImageFile.name,
                        imageUrl: e.target.result // 배경 랜더링용
                    });

                    canvasInstance.current.add(fabricImage);
                    canvasInstance.current.setActiveObject(fabricImage);
                    canvasInstance.current.renderAll();
                };

                imgElement.onerror = () => {
                    console.error('이미지 로드 실패');
                };
            };

            reader.onerror = function () {
                console.error('파일 읽기 실패');
            };

            reader.readAsDataURL(addImageFile);
        }
    }, [addImageFile]);
    // 이미지 추가 ---------------------------------------------------(section 11)
    // ---------------------------------------------------------------(section)
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
    // ---------------------------------------------------------------(section)
    // delete --------------------------------------------------------(section 12)
    useDeleteKeyHandler(canvasInstance, isReady);
    // ---------------------------------------------------------------(section 12)
    // zoom in zoom out ----------------------------------------------(section 13)
    useCanvasZoom(canvasInstance, isReady);
    // ---------------------------------------------------------------(section 13)
    // 클릭 이벤트----- ----------------------------------------------(section 14)
    useCanvasClickDeselect(canvasInstance, onObjectSelect);
    // ---------------------------------------------------------------(section 14)
    // 원근법 기반 프레임 왜곡 배경 ----------------------------------(section 16)

    const { previewPerspective } = useWallHoverHandler({
        canvasInstance, hoveredWallLocal, originalStyles, isDragging, setHoveredWall,
        position, size, edgeFrameState, angle,
        setHoveredWallVertices, selectedTool, perspective, perspectiveRef, setPerspective, 
    });

        // 프레임 컨트롤러 조작시 자동으로 꼭지점 재계산
        useSyncPerspective(canvasInstance, getWallsFromCanvas, getWallVertices, setPerspective);

    // 원근법 기반 프레임 왜곡 배경 ----------------------------------(section 16)

    // ↓ 원근법 디버깅을 위해 일부 레이어 겹침 -----------------------(section 17)
    
    const scrollRef = useRef(null);

    const onWheel = (e) => {1
        e.preventDefault();

        if (scrollRef.current) {
            scrollRef.current.scrollLeft += e.deltaY * 0.7; // 세로 휠 deltaY를 가로 스크롤로 변환
        }
    };
    
    return (
        <div
            className='Editor_screen'
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div className='screen_area'>
                <div className='screen'>
                    <div ref={containerRef} style={{ position: 'relative', width: 1100, height: 650 }}>
                        <canvas
                            ref={canvasRef} id="my-canvas" width={1100} height={650}
                            style={{ position: 'absolute', top: 0, left: 0, zIndex: 2,}}
                        />

                        {perspectiveWalls.map((wall) => {
                            return (
                                <div
                                key={wall.wallType}
                                style={{
                                    position: 'absolute',
                                    top: 0, left: 0, width: 1100, height: 650,
                                    pointerEvents: 'none',
                                    zIndex: 1,
                                    opacity: 1,
                                }}
                                >
                                <WebGLPerspectiveComponent
                                    items={[{
                                    imageUrl: wall.imageUrl,
                                    vertices: wall.vertices,
                                    wallType: wall.wallType,
                                    }]}
                                    width={1100}
                                    height={650}
                                />
                                </div>
                            );
                        })}

                        {/* 미리보기용 perspective 렌더링 추가 */}
                        {Object.entries(previewPerspective).map(([wallType, { vertices, imageUrl }]) => {
                        if (!vertices || vertices.length === 0) {return null;}
                            return (
                                <div
                                    key={`preview-${wallType}`}
                                    style={{
                                        position: 'absolute',
                                        top: 0, left: 0, width: 1100, height: 650,
                                        pointerEvents: 'none',
                                        zIndex: 3, // 실제 perspective 위에 렌더링
                                        opacity: 0.5, // 미리보기는 반투명
                                    }}
                                >
                                <WebGLPerspectiveComponent
                                    items={[{ imageUrl, vertices, wallType, }]}
                                    width={1100}
                                    height={650}
                                />
                                </div>
                            );
                        })}
                    </div>
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
                <div className='room_window' ref={scrollRef} onWheel={onWheel}>
                    <div className='room_area_scroll'>
                        {game.room.map((roomData, roomIndex) => {
                            return (

                                <div className='room' key={roomIndex} onClick={() => handleCurrentRoom(roomIndex)}>
                                    <div className='stage_wrap'>
                                        <div className='stageIndex_delete'>
                                            <h3>Stage {roomIndex + 1}</h3>
                                            <button onClick={() => handleDeleteGameRoom(roomIndex)}>X</button>
                                        </div>
                                        <input type="text" value={roomData.name || ''} onChange={(e) => handleChangeRoomName(roomIndex, e.target.value)} placeholder='이름'/>
                                    </div>

                                    {roomIndex == currentRoom && (
                                        <div className='side_area'>
                                            {room.side.map((sideData, sideIndex) => {
                                                const isSelected = selectedSide.roomIndex === roomIndex && selectedSide.sideIndex === sideIndex;

                                                return(
                                                    <div className={`side_wrap ${isSelected ? 'selected' : ''}`}  key={sideIndex}> 
                                                        <div className={`side ${isSelected ? 'selected' : ''}`} onClick={() => handleCurrentSide(sideIndex)}>
                                                            {sideImgSrcs[currentRoom][sideIndex] && <img src={sideImgSrcs[currentRoom][sideIndex]} width={90} height={55} onClick={() => loadCanvas(canvasInstance.current, sideData, controlStyle, roomController, setPosition, setSize, setAngle, setEdgeFrameState, addFrame)}/>}
                                                            <button onClick={(e) => {
                                                                e.stopPropagation();  // 클릭 이벤트 전파 막기
                                                                handleDeleteGameSide();
                                                            }}>-</button>
                                                        </div>

                                                        <div className="info">
                                                            <h4>{sideIndex + 1}</h4>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            <button onClick={handleAddGameSide}>+</button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                                
                        <button onClick={handleAddGameRoom}>+</button>
                    </div>
                </div>
            </div>
        </div>
        
    );


}

export default Editor;