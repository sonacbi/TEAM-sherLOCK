import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import * as fabric from 'fabric';
import debounce from 'lodash/debounce';

import './Editor.css';

import { createRoomFrame } from '../../../modules/handlePolygon';
import { GamePnC, Room, Side } from '../../../modules/editor/gamePnC';
import { handleSide, loadCanvas, loadGame, loadGameZip } from '../../../modules/editor/handleGame';
import WebGLPerspectiveComponent from './PerspectiveFrame/WebGLPerspectiveComponent';
import { getShapeByType } from './getShapeByType';
import { useDeleteKeyHandler, useCanvasZoom, useCanvasClickDeselect, useCopyNPaste } from './useCanvasHandlers';
import { useWallHoverHandler } from './PerspectiveFrame/useWallHoverhandler';
import { getWallsFromCanvas, getWallVertices } from './PerspectiveFrame/perspectiveBackground';
import useSyncPerspective from './PerspectiveFrame/useSyncPerspective';
import PerspectiveSVG from './PerspectiveSVG'; // 룸정보 - 사이드 배경 렌더링용

function Editor({ handleDrop, addTextTrigger, addShapeTrigger, setAddImageFile, addImageFile, addFrameTrigger, edgeFrameState, setEdgeFrameState, saveTool, gameZip, onObjectSelect, selectedTool, canvases }) {
    const {game, setGame, room, setRoom, currentRoom, setCurrentRoom, currentSide, setCurrentSide, sideImgSrcs, setSideImgSrcs, imgs, setImgs} = saveTool;
    const {canvasRef, canvasInstance} = canvases;
    const [isReady, setIsReady] = useState(false);
    const [angle, setAngle] = useState(0);
    const [position, setPosition] = useState([220, 120]);
    const [size, setSize] = useState([220 + 440, 120 + 300]);
    const isDragging = useRef(false); // React 훅에서 드래그 상태 저장용 useRef
    const [isReadyToLoad, setIsReadyToLoad] = useState(false);

    const currentRoomRef = useRef(currentRoom);
    const currentSideRef = useRef(currentSide);

    // currentRoom, currentSide가 바뀔 때마다 ref도 업데이트
    useEffect(() => { currentRoomRef.current = currentRoom; }, [currentRoom]);
    useEffect(() => { currentSideRef.current = currentSide; }, [currentSide]);

    // 프레임 원근법 배경 왜곡 디버깅 코드 + 상태 관리 코드 ------------ (section 1) (정다정)
    //디버깅용
    const containerRef = useRef(null);

    // 3D 배경 처리용
    const hoveredWallLocal = useRef(null); // 현재 마우스가 호버중인 벽 객체 저장 (이벤트 핸들러 전용)
    const originalStyles = useRef(new Map()); // 호버된 벽의 원래 스타일을 저장하는 Map (객체별)
    // 최종 저장된 이미지와 꼭짓점
    const [perspective, setPerspective] = useState({});
    // perspective 항상 최신값을 유지하도록 관리
    const perspectiveRef = useRef(perspective);
    useEffect(() => { perspectiveRef.current = perspective; }, [perspective]);
    // 현재 호버된 벽 객체 상태
    const [hoveredWall, setHoveredWall] = useState(null);
    // 현재 호버된 벽의 꼭지점 좌표 (WebGL 컴포넌트 전달용)
    const [hoveredWallVertices, setHoveredWallVertices] = useState([]);

    const [selectedSide, setSelectedSide] = useState({ roomIndex: 0, sideIndex: 0 });
    
    // perspectiveWalls를 벽 객체 배열로 관리
    const perspectiveWalls = React.useMemo(() => {
  if (!perspective) return [];

  const wall_room = String(currentRoomRef.current);
  const wall_side = String(currentSideRef.current);

  // perspective에 있는 방 개수 혹은 현재 방 번호+1 중 큰 값으로 방 개수 고정
  const totalRooms = Math.max(Object.keys(perspective).length, Number(wall_room) + 1);

  const result = [];

  for (let i = 0; i < totalRooms; i++) {
    const roomId = String(i);
    const sides = perspective[roomId] || {}; // 데이터가 없으면 빈 객체

    // 현재 방이라도 모든 side를 포함하도록 수정
    const filteredSides = {};

    Object.entries(sides).forEach(([sideId, walls]) => {
      // 모든 side를 넣음
      filteredSides[sideId] = { ...walls };
    });

    // 만약 side가 아예 없으면 기본값(빈 객체) 넣기
    if (Object.keys(filteredSides).length === 0) {
      filteredSides['0'] = {};
    }

    result.push({
      currentRoom: roomId,
      ...filteredSides,
    });
  }

  console.log('[useMemo] items:', result);

  return result;
}, [perspective]);




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
    const roomController = useRef(new fabric.Rect({
        ...controlStyle,
        left: 220,
        top: 120,
        width: 220 + 440,
        height: 120 + 300,
        fill: 'rgba(255, 0, 0, 0.2)',
        strokeWidth: 2,
        stroke: 'red',
        name: "SherLockRoomController",
    })).current;
    useEffect(() => {
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
            perPixelTargetFind: false,
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

        setIsReady(true);
        return () => canvas.dispose();
    }, []);
    //                           -------------------------------------(section 5)
    // 처음 텍스트도 저장되게
    useEffect(()=>{
        if (isReady) saveCanvasToSide();
    }, [isReady])
    // 캔버스가 렌더되면 저장 ----------------------------------------(section) (노은성)
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        canvas.on('before:render', debouncedSave);

        return () => {
            canvas.off('before:render', debouncedSave);
            debouncedSave.cancel();
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
            perPixelTargetFind: false,
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

        // const result = perspectiveWalls.map(wall => {
        //     if (hoveredWall && hoveredWall.wallType === wall.wallType) {
        //         return {
        //         ...wall,
        //         vertices: hoveredWallVertices.length === 4 ? hoveredWallVertices : wall.vertices,
        //         imageUrl: perspective[wall.wallType]?.imageUrl ?? '',
        //         };
        //     }
        //     return wall;
        // });
        // roomFrame 안에 있는 모든 하위 오브젝트(fabric.js 기준)들을 가져옴 (📝 구조 변경돼서 수정)
        const frameObjects = roomFrame.getObjects?.() ?? [];

        // 현재 방(currentRoom)과 현재 면(currentSide)에 해당하는 벽 정보 집합을 가져옴
        // 구조: perspective = { [room]: { [side]: { wallType: { vertices, imageUrl, ... } } } }
        const currentWalls = perspective[currentRoom]?.[currentSide] ?? {};
        // 각 벽 오브젝트에 대해 해당 wallType에 imageUrl이 존재하면 fill/stroke를 투명하게 설정
        frameObjects.forEach(obj => {
            const wallData = currentWalls[obj.wallType];
            if (wallData?.imageUrl) {
                obj.set({ fill: 'rgba(255,255,255,0)', stroke: 'rgba(255,255,255,0)' });
            }
        });
        // 만약 정면(front) 벽에 imageUrl이 있으면 roomController도 숨김 처리
        if (currentWalls['front']?.imageUrl) {
            roomController.set({ fill: 'rgba(255,255,255,0)', stroke: 'rgba(255,255,255,0)' });
        }
        // roomFrame을 캔버스 맨 뒤로 보내고 전체 다시 렌더링
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
        if (game.room.length <= 1) return;

        setGame(prev => {
            const newRooms = [...prev.room];
            newRooms.splice(roomSide, 1);
            return new GamePnC({ ...prev, room: newRooms });
        });

        setSideImgSrcs(prev => {
            const newImgs = [...prev];
            newImgs.splice(roomSide, 1);
            return newImgs;
        });

        // 선택된 room이 삭제된 경우 → 초기화
        // 선택된 room이 뒤에 있던 경우 → index 하나 앞으로
        setSelectedSide(prev => {
            if (prev.roomIndex === roomSide) {
                return { roomIndex: -1, sideIndex: -1 };
            } else if (prev.roomIndex > roomSide) {
                return { ...prev, roomIndex: prev.roomIndex - 1 };
            } else {
                return prev;
            }
        });

        // currentRoom 인덱스 보정
        setCurrentRoom(prev => {
            if (prev === roomSide) return Math.max(0, prev - 1);
            else if (prev > roomSide) return prev - 1;
            else return prev;
        });

        // 해당 room 인덱스와 일치하는 원근법 배경 객체 초기화
        setPerspective(prev => {
            // 삭제할 room 인덱스(roomSide)
            const roomToDelete = roomSide;
            const newPerspective = { ...prev };

            // 해당 room 삭제
            delete newPerspective[roomToDelete];

            // 남은 room 키들을 숫자 순으로 정렬하고, 삭제된 방 뒤 인덱스들은 -1씩 당겨야 함
            const adjustedPerspective = {};
            Object.keys(newPerspective)
                .map(k => Number(k))
                .sort((a, b) => a - b)
                .forEach(oldKey => {
                    const newKey = oldKey > roomToDelete ? oldKey - 1 : oldKey;
                    adjustedPerspective[newKey] = newPerspective[oldKey];
                });

            return adjustedPerspective;
        });

    };

    const handleDeleteGameSide = (deletedIndex) => {
        if (room.side.length <= 1) return;

        // 삭제 후 선택할 인덱스 계산
        const newLength = room.side.length - 1;
        const newSideIndex1 = deletedIndex >= newLength ? newLength - 1 : deletedIndex;
        const newSideIndex2 = deletedIndex == newLength ? newLength - 1 : deletedIndex;

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

        handleCurrentSide(newSideIndex1, game.room[currentRoom].side[newSideIndex2+1])

        // 해당 side 인덱스와 일치하는 원근법 배경 객체 초기화
        setPerspective(prev => {
            const roomIdx = currentRoom;  // 현재 방 번호
            const sideToDelete = deletedIndex;  // 삭제할 side 인덱스

            if (!prev[roomIdx]) return prev;

            // 해당 room의 sides 객체를 복사
            const roomSides = { ...prev[roomIdx] };

            // 삭제할 side 삭제
            delete roomSides[sideToDelete];

            // 남은 side 키들 재정렬 (숫자 순, 삭제된 뒤쪽 인덱스는 -1)
            const adjustedSides = {};
            Object.keys(roomSides)
                .map(k => Number(k))
                .sort((a, b) => a - b)
                .forEach(oldKey => {
                    const newKey = oldKey > sideToDelete ? oldKey - 1 : oldKey;
                    adjustedSides[newKey] = roomSides[oldKey];
                });

            return {
                ...prev,
                [roomIdx]: adjustedSides
            };
        });

    };

    const handleCurrentRoom = (roomIndex) => {
        setCurrentRoom(roomIndex);
    }

    const handleCurrentSide = (sideIndex, sideData) => {
        setCurrentSide(sideIndex);
        setTimeout(() => {
            loadCanvas(canvasInstance.current, imgs, sideData, controlStyle, roomController, setEdgeFrameState);
        }, 50)
        setSelectedSide({ roomIndex: currentRoom, sideIndex });
    }

    const handleChangeRoomName = (roomIndex, name) => {
        setGame(prev => {
            const newData = { ...prev };
            newData.room[roomIndex].name = name;
            return new GamePnC(newData);
        })
    }

    const saveCanvasToSide = useCallback(() => {
        const updatedFabric = handleSide(canvasInstance.current);
        setRoom(prev => {
            const newData = new Room({ ...prev })
            newData.side[currentSide].fabric = updatedFabric;
            if (canvasInstance.current.getObjects().find(obj => obj.name === 'SherLockRoomFrame')) newData.side[currentSide].frame = {
                x: roomController.left,
                y: roomController.top,
                width: roomController.width,
                height: roomController.height,
                angle: roomController.angle,
                top: edgeFrameState[0],
                left: edgeFrameState[1],
                right: edgeFrameState[2],
                bottom: edgeFrameState[3],
            }
            return newData;
        });
        setSideImgSrcs(prev => {
            const newData = [ ...prev ];
            newData[currentRoom][currentSide] = canvasRef.current.toDataURL({
                format: 'jpeg',
                quality: 0.1,
            });
            return newData;
        });
    }, [canvasInstance, canvasRef, currentSide, currentRoom, setRoom, setSideImgSrcs]);

    const debouncedSave = debounce(() => {
        setTimeout(() => {
            saveCanvasToSide();
        }, 100);
    }, 300);

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
            loadGame(game, setCurrentRoom, handleCurrentSide, setSideImgSrcs);
            setIsReadyToLoad(false);
        }
    }, [isReadyToLoad, game]);
    useEffect(() => {
        if (isReady && gameZip) {
            loadGameZip(gameZip, setGame, setImgs, setIsReadyToLoad);
        }
    }, [gameZip]);
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

                    // ✅ 여기서 비워주기
                    setAddImageFile(null);
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
    useDeleteKeyHandler(canvasInstance, isReady, setImgs);
    // ---------------------------------------------------------------(section 12)
    // zoom in zoom out ----------------------------------------------(section 13)
    useCanvasZoom(canvasInstance, isReady);
    // ---------------------------------------------------------------(section 13)
    // 클릭 이벤트----- ----------------------------------------------(section 14)
    useCanvasClickDeselect(canvasInstance, onObjectSelect);
    // ---------------------------------------------------------------(section 14)
    useCopyNPaste(canvasInstance);
    // 원근법 기반 프레임 왜곡 배경 ----------------------------------(section 16)

    const { previewPerspective } = useWallHoverHandler({
        canvasInstance, hoveredWallLocal, originalStyles, isDragging, setHoveredWall,
        position, size, edgeFrameState, angle,
        setHoveredWallVertices, selectedTool, perspective, perspectiveRef, setPerspective,
        currentRoom, currentSide, // 📝 현재 방과 사이드를 벽 정보에 추가함
        currentSideRef, currentRoomRef, // 📝 현재 방과 사이드를 벽 정보에 추가함 (최신값 강제반영)
    });

        // 프레임 컨트롤러 조작시 자동으로 꼭지점 재계산
        useSyncPerspective(canvasInstance, getWallsFromCanvas, getWallVertices, setPerspective, currentRoom, currentSide);

        // 미리보기용 구성
        const roomKey = Number(currentRoom);

        const previewItems = Object.entries(previewPerspective?.[roomKey]?.[0] || {})
        .filter(([_, wall]) => wall.imageUrl)
        .map(([wallType, wall]) => ({
            wallType,
            vertices: wall.vertices,
            imageUrl: wall.imageUrl,
        }));

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

                        {perspective[currentRoom]?.[currentSide] && // 📝 현재 방과 사이드를 참조하여 렌더링
                            Object.entries(perspective[currentRoom][currentSide]).map(([wallType, wall]) => ( 
                                <div
                                    key={`${wallType}-${currentRoom}-${currentSide}`}
                                    style={{
                                        position: 'absolute',
                                        top: 0, left: 0,
                                        width: 1100, height: 650,
                                        pointerEvents: 'none',
                                        zIndex: 1,
                                    }}
                                >
                                    <WebGLPerspectiveComponent
                                        items={[{ imageUrl: wall.imageUrl, vertices: wall.vertices, wallType, }]}
                                        width={1100} height={650}
                                    />
                                </div>
                            ))}

                        {/* 미리보기용 perspective 렌더링 추가 */}
                        {previewItems.map(({ wallType, vertices, imageUrl }) => (
                            <div
                                key={`preview-${wallType}-${currentRoom}`}
                                style={{
                                position: 'absolute',
                                top: 0, left: 0,
                                width: 1100, height: 650,
                                pointerEvents: 'none',
                                zIndex: 2, opacity: 0.7,
                                }}
                            >
                                <WebGLPerspectiveComponent
                                items={[{ imageUrl, vertices, wallType }]}
                                width={1100}
                                height={650}
                                />
                            </div>
                        ))}
                        
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

                                            return (
                                                <div className={`side_wrap ${isSelected ? 'selected' : ''}`} key={sideIndex} style={{ position: 'relative' }}>
                                                <div
                                                    className={`side ${isSelected ? 'selected' : ''}`}
                                                    onClick={() => handleCurrentSide(sideIndex, sideData)}
                                                    style={{ position: 'relative', zIndex: 2 }}
                                                >
                                                    {sideImgSrcs[currentRoom][sideIndex] && (
                                                    <img src={sideImgSrcs[currentRoom][sideIndex]} width={90} height={55} />
                                                    )}
                                                    <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGameSide(sideIndex);
                                                    }}
                                                    >
                                                    -
                                                    </button>
                                                </div>

                                                <div className="info" style={{ position: 'relative', zIndex: 1 }}>
                                                    <h4>{sideIndex + 1}</h4>
                                                </div>

                                                {/* 모든 side마다 PerspectiveSVG 렌더링 */}
                                                    <div
                                                        style={{ position: 'absolute',
                                                        top: '5px', left: 0,
                                                        margin: 'auto',
                                                        width: '90px', height: '55px',
                                                        pointerEvents: 'none',
                                                        zIndex: 1,
                                                        background : 'white', // ✏️ 해당 사이드의 배경을 여기서 설정해주세요.
                                                        }}
                                                    >
                                                        <PerspectiveSVG perspectiveWalls={perspectiveWalls} roomData={roomData} roomIndex={roomIndex} sideIndex={sideIndex} />
                                                    </div>
                                                </div>
                                            );
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