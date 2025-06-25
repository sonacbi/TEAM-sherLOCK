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

function Editor({ handleDrop, addTextTrigger, textSize, addShapeTrigger, setAddImageFile, addImageFile, addFrameTrigger, edgeFrameState, setEdgeFrameState, saveTool, gameZip, onObjectSelect, selectedTool, canvases }) {
    const {game, setGame, room, setRoom, currentRoom, setCurrentRoom, currentSide, setCurrentSide, sideImgSrcs, setSideImgSrcs, imgs, setImgs, setNamedFabrics} = saveTool;
    const {canvasRef, canvasInstance} = canvases;
    const [isReady, setIsReady] = useState(false);
    const [angle, setAngle] = useState(0);
    const [position, setPosition] = useState([220, 120]);
    const [size, setSize] = useState([220 + 440, 120 + 300]);
    const isDragging = useRef(false); // React 훅에서 드래그 상태 저장용 useRef
    const [isReadyToLoad, setIsReadyToLoad] = useState(false);
    const [openedRooms, setOpenedRooms] = useState([0]);

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
    // 미리보기 캡쳐
    const [isPerspectiveUpdated, setIsPerspectiveUpdated] = useState(false);

    const [selectedSide, setSelectedSide] = useState({ roomIndex: 0, sideIndex: 0 });

    const [isPerspectiveRender, setIsPerspectiveRender] = useState(true);
    useEffect(() => { // selectedSide가 null이 아니고, currentRoom과 매칭되면만 렌더링 ON
        if (selectedSide && selectedSide.roomIndex === currentRoom) { setIsPerspectiveRender(true);
        } else { setIsPerspectiveRender(false); } }, [selectedSide, currentRoom]
    );

    // perspectiveWalls를 벽 객체 배열로 관리
    const perspectiveWalls = React.useMemo(() => {
    if (!perspective) return [];

    const wall_room = String(currentRoomRef.current);
    const wall_side = String(currentSideRef.current);

    // perspective 구조:
    // {
    //   [roomId]: {
    //     [sideId]: {
    //       [wallType]: { imageUrl, vertices, ... }
    //     }
    //   }
    // }

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

        // side가 아예 없으면 기본값으로 side_0 빈 객체 삽입
        if (Object.keys(filteredSides).length === 0) {
        filteredSides['0'] = {};
        }

        // 각 room 객체는 다음과 같은 형태로 리턴됨:
        // {
        //   currentRoom: "0",
        //   0: { front: {...}, top: {...}, ... },
        //   1: { ... },
        //   ...
        // }
        result.push({
        currentRoom: roomId,
        ...filteredSides,
        });
    }

    // if (process.env.NODE_ENV === 'development' && hoveredWall) {
        // console.log('[useMemo] items:', result);
    // }

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
        perPixelTargetFind: true,
    };
    // ---------------------------------------------------------------(section 2) ?
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
        const textbox = new fabric.Textbox('셜LOCK 에디터', {
            ...controlStyle,
            fontSize: 50,
            fill: '#333333',
            width: 340,
            editable: true,
            strokeWidth: 0,
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
            onObjectSelect(e.selected[0]);

            const activeObject = canvas.getActiveObject();

            if (activeObject && activeObject.type.toLowerCase() === 'activeselection') {
                activeObject.set({
                    transparentCorners: false,
                    cornerStrokeColor: '#A9DB78',
                    cornerColor: 'white',
                    cornerStyle: 'circle',
                    borderScaleFactor: 2,
                    borderColor: '#A9DB78',
                    editingBorderColor: '#A9DB78',
                });
                activeObject.setControlsVisibility({ mt: false, mb: false, ml: false, mr: false });
                canvas.requestRenderAll();
            }
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
        if (isReady) addTextBox(textSize);
    }, [addTextTrigger]);

    useEffect(() => {
        if (isReady && addShapeTrigger) {
            addShape(addShapeTrigger);
        }
    }, [addShapeTrigger]);

    useEffect(() => {
        if (!isReady) return;
        switch (addFrameTrigger.type) {
            case 'basic':
                addFrame(280, 80, 500, 360, [170, 240, 240, 150], currentRoomRef, currentSideRef, perspectiveRef);
                break;
            case 'edge':
                addFrame(530, -10, 640, 120+300, [170, 225, 240, 120], currentRoomRef, currentSideRef, perspectiveRef);
                break;
            case 'corridor':
                addFrame(450, 50, 130, 180, [330, 225, 225, 110], currentRoomRef, currentSideRef, perspectiveRef);                
                break;
            default:
                console.warn('존재하지 않는 형식입니다');
                break;
        }
    }, [addFrameTrigger]);
    // useEffect(() => {
    //     if (isReady) {
    //         // 거의 초마다 실행되는 문제 있음
    //         const frame = game.room[currentRoom].side[currentSide].frame;
    //         frame && addFrame(frame.x, frame.y, frame.width, frame.height, frame.edge, currentRoomRef, currentSideRef, perspectiveRef);
    //     }
    // }, [game.room[currentRoom].side[currentSide]?.frame]);
    //                           -------------------------------------(section 6)

    // 텍스트 추가  --------------------------------------------------(section 7)
    const addTextBox = (size) => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const textStyleMap = {
            big: { fontSize: 60, width: 240, label: '큰 텍스트' },
            middle: { fontSize: 40, width: 200, label: '중간 텍스트' },
            small: { fontSize: 24, width: 120, label: '작은 텍스트' },
        };

        const { fontSize, width, label } = textStyleMap[size] || { fontSize: 40, width: 160, label: '새 텍스트' };

        const textbox = new fabric.Textbox(label, {
            ...controlStyle,
            fontSize,
            fill: '#333333',
            width,
            editable: true,
            strokeWidth: 0,
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
    const addFrame = (left, top, width, height, edge, currentRoomRef, currentSideRef, perspectiveRef) => {
        const canvas = canvasInstance.current;
        if (!canvas) return;
        
        const target = canvas.getObjects().find(obj => obj.name === 'SherLockRoomFrame');
        if (target) canvas.remove(target);
        
        const roomFrame = createRoomFrame(
            left, top, width, height, ...edge
        );

        canvas.add(roomFrame);
        if (!canvas.getObjects().find(obj => obj.name === 'SherLockRoomController')) {
            const roomController = new fabric.Rect({
                ...controlStyle,
                fill: 'rgba(255, 0, 0, 0.2)',
                strokeWidth: 2,
                stroke: 'red',
                left, top, width, height, edge,
                name: "SherLockRoomController",
                perPixelTargetFind: false,
            });
            roomController.setControlVisible('mtr', false);

            const makeFrame = () => addFrame(roomController.left, roomController.top, roomController.getScaledWidth(), roomController.getScaledHeight(), game.room[currentRoom].side[currentSide]?.frame?.edge ?? roomController.edge, currentRoomRef, currentSideRef, perspectiveRef);

            roomController.on('moving', makeFrame);
            roomController.on('scaling', makeFrame);
            // ✅ 조작 끝난 후 한 번만 호출 (추가 캡처)
            const handleModified = () => { setIsPerspectiveUpdated(true); };
            roomController.on('modified', handleModified);

            canvas.add(roomController);
            canvas.setActiveObject(roomController);
            canvas.sendObjectToBack(roomController);
        }

        const roomController = canvasInstance.current.getObjects().find(obj => obj.name === 'SherLockRoomController');
        const currentWalls = perspectiveRef.current?.[currentRoomRef.current]?.[currentSideRef.current] ?? {};

        // 🔽 front 벽에 이미지가 없다면 자동으로 front 벽 그리기
        if (!currentWalls['front']?.imageUrl) {
            const frontWall = roomFrame.getObjects?.().find(obj => obj.wallType === 'front');
                if (frontWall) {
                // roomController도 보이게 설정
                roomController.set({
                    fill: 'rgba(255,0,0,0.2)',
                    stroke: 'red',
                });
            }
        }

        // 프레임 안 오브젝트 스타일 설정
        const frameObjects = roomFrame.getObjects?.() ?? [];
        frameObjects.forEach(obj => {
            const wallData = currentWalls[obj.wallType];
            if (wallData?.imageUrl) {
                obj.set({ fill: 'rgba(255,255,255,0)', stroke: 'rgba(255,255,255,0)' });
            }
        });

        // front 벽에 이미지 있을 경우 컨트롤러 숨김 처리
        if (currentWalls['front']?.imageUrl) {
            roomController.set({ fill: 'rgba(255,255,255,0)', stroke: 'rgba(255,255,255,0)' });
        }

        // roomFrame을 캔버스 맨 뒤로 보내고 전체 다시 렌더링
        canvas.sendObjectToBack(roomFrame);
        
        canvas.renderAll();

        return () => { roomController.off('modified', handleModified); };
    };
    
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const handleMouseUp = () => {
            setIsPerspectiveUpdated(true);
        };

        canvas.on('mouse:up', handleMouseUp);

        return () => {
            canvas.off('mouse:up', handleMouseUp);
        };
    }, []);

    const handleAddGameRoom = () => {
        setGame(prev => (new GamePnC({
            ...prev, room: [...prev.room, new Room({})]
        })));
        setSideImgSrcs(prev => [...prev, ['']]);
    }

    const handleAddGameSide = (roomIndex) => {
        setGame(prev => {
            const newData = new GamePnC(prev);
            newData.room[roomIndex].side.push(new Side({}));
            return newData;
        });
        setSideImgSrcs(prev => {
            const newData = prev;
            newData[roomIndex].push('');
            return newData;
        })
    }

    const handleDeleteGameRoom = (roomSide) => {
        if (game.room.length <= 1) return;

        if (currentRoom < roomSide) {}
        else if (roomSide == 0 && currentRoom == 0) {
            handleCurrentSide(0, 0, game.room[currentRoom+1].side[0]);
            setSelectedSide(prev => ({...prev, roomIndex: currentRoom}));
        }
        else if (roomSide < currentRoom) {
            setCurrentRoom(prev => prev-1);
            handleCurrentSide(currentRoom-1, 0, game.room[currentRoom].side[0]);
            setSelectedSide(prev => ({...prev, roomIndex: currentRoom-1}));
        }
        else if (roomSide == currentRoom) {
            setCurrentRoom(prev => prev-1);
            handleCurrentSide(currentRoom-1, 0, game.room[currentRoom-1].side[0]);
            setSelectedSide(prev => ({...prev, roomIndex: currentRoom-1}));
        }

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
            
            setIsPerspectiveUpdated(true); // 벽 미리보기 렌더링
            return adjustedPerspective;
        });
    };

    const handleDeleteGameSide = (deletedIndex) => {
        if (game.room[currentRoom].side.length <= 1) return;

        setGame(prev => {
            const newData = new GamePnC(prev);
            newData.room[currentRoom].side.splice(deletedIndex, 1);
            return newData;
        });

        setSideImgSrcs(prev => {
            const newImgs = [...prev];
            if (!newImgs[currentRoom]) return prev;
            const updatedSides = [...newImgs[currentRoom]];
            updatedSides.splice(deletedIndex, 1);
            newImgs[currentRoom] = updatedSides;
            return newImgs;
        });

        /**
        a| 길이<=1 : return;
        a| 현재<삭제 : return;
        b| 삭제,현재==0 : (현재, 현재+1)
        c| 삭제>현재 : (현재-1, 현재?)
        d| 삭제==현재 : (현재-1, 현재-1)
         */

        if (currentSide < deletedIndex) {}
        else if (deletedIndex == 0 && currentSide == 0) handleCurrentSide(currentRoom, currentSide, game.room[currentRoom].side[currentSide+1]);
        else if (deletedIndex < currentSide) handleCurrentSide(currentRoom, currentSide-1, game.room[currentRoom].side[currentSide]);
        else if (deletedIndex == currentSide) handleCurrentSide(currentRoom, currentSide-1, game.room[currentRoom].side[currentSide-1]);

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
            
            setIsPerspectiveUpdated(true); // 벽 미리보기 렌더링
            return {
                ...prev,
                [roomIdx]: adjustedSides
            };
        });

    };

    const handleShowRoom = (roomIndex) => {
        openedRooms.includes(roomIndex) ? setOpenedRooms(prev => prev.filter(num => num !== roomIndex)) : setOpenedRooms(prev => [...prev, roomIndex]);
        // setIsPerspectiveUpdated(true); // 벽 미리보기 렌더링
    }

    const handleCurrentSide = (roomIndex, sideIndex, sideData) => {
        setCurrentRoom(roomIndex);
        setCurrentSide(sideIndex);
        setTimeout(() => {
            loadCanvas(canvasInstance.current, imgs, sideData, controlStyle, addFrame, currentRoomRef, currentSideRef, perspectiveRef);
        }, 50)
        setSelectedSide({ roomIndex, sideIndex });
        setIsPerspectiveUpdated(true); // 벽 미리보기 렌더링
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
        setGame(prev => {
            const newData = new GamePnC(prev);
            newData.room[currentRoom].side[currentSide].fabric = updatedFabric;
            const roomController = canvasInstance.current.getObjects().find(obj => obj.name === 'SherLockRoomController');
            if (roomController) {
                const wallObj = perspectiveRef.current?.[currentRoom]?.[currentSide] ?? {}; // ✅ 조회용 필드 추가
                const directions = ['front', 'top', 'left', 'right', 'bottom']; // ✅ 조회용 필드 추가
                
                newData.room[currentRoom].side[currentSide].frame = {
                    x: Number(roomController.left.toFixed(2)),
                    y: Number(roomController.top.toFixed(2)),
                    width: Number(roomController.getScaledWidth().toFixed(2)),
                    height: Number(roomController.getScaledHeight().toFixed(2)),
                    edge: game.room[currentRoom].side[currentSide]?.frame?.edge ?? roomController.edge,

                    // ✅ edgeImg 필드 추가
                    edgeImg: directions.map(dir => {
                        const wall = wallObj[dir];
                        return wall?.imgName ?? '';
                    }),
                };
                
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

    }, [canvasInstance, canvasRef, currentSide, currentRoom, game, setGame, setSideImgSrcs, perspectiveRef, imgs]);

    const debouncedSave = debounce(() => {
        setTimeout(() => {
            saveCanvasToSide();
        }, 1);
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
                        imgName: addImageFile.name,
                        imageUrl: e.target.result, // 배경 랜더링용
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
    // delete --------------------------------------------------------(section 12)
    useDeleteKeyHandler(canvasInstance, isReady, setImgs, game, setNamedFabrics);
    // ---------------------------------------------------------------(section 12)
    // zoom in zoom out ----------------------------------------------(section 13)
    useCanvasZoom(canvasInstance, isReady);
    // ---------------------------------------------------------------(section 13)
    // 클릭 이벤트----- ----------------------------------------------(section 14)
    useCanvasClickDeselect(canvasInstance, onObjectSelect);
    // ---------------------------------------------------------------(section 14)
    useCopyNPaste(canvasInstance, controlStyle);
    // 원근법 기반 프레임 왜곡 배경 ----------------------------------(section 16)

    const { previewPerspective } = useWallHoverHandler({
        canvasInstance, hoveredWallLocal, originalStyles, isDragging, setHoveredWall,
        position, size, edgeFrameState, angle,
        setHoveredWallVertices, selectedTool, perspective, perspectiveRef, setPerspective,
        currentRoom, currentSide, // 📝 현재 방과 사이드를 벽 정보에 추가함
        currentSideRef, currentRoomRef, // 📝 현재 방과 사이드를 벽 정보에 추가함 (최신값 강제반영)
        setIsPerspectiveUpdated, // 캡쳐 이벤트
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
                                    {isPerspectiveRender && (<WebGLPerspectiveComponent
                                        items={[{ imageUrl: wall.imageUrl, vertices: wall.vertices, wallType, }]}
                                        width={1100} height={650}
                                    />)}
                                </div>
                            ))
                        }   

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
                                <div className='room' key={roomIndex}>
                                    <div className='stage_wrap' onClick={() => handleShowRoom(roomIndex)}>
                                        <div className='stageIndex_delete'>
                                            <h3>Stage {roomIndex + 1}</h3>
                                            <button onClick={(e) => {e.stopPropagation(); handleDeleteGameRoom(roomIndex)}}>X</button>
                                        </div>
                                        <input type="text" value={roomData.name || ''} onChange={(e) => handleChangeRoomName(roomIndex, e.target.value)} onClick={e => e.stopPropagation()} placeholder='이름'/>
                                    </div>

                                    {openedRooms.includes(roomIndex) && (
                                        <div className='side_area'>
                                            {roomData.side.map((sideData, sideIndex) => {
                                                const isSelected = selectedSide.roomIndex === roomIndex && selectedSide.sideIndex === sideIndex;

                                                return (
                                                    <div className={`side_wrap ${isSelected ? 'selected' : ''}`} key={sideIndex} style={{ position: 'relative' }}>
                                                    <div
                                                        className={`side ${isSelected ? 'selected' : ''}`}
                                                        onClick={() => handleCurrentSide(roomIndex, sideIndex, sideData)}
                                                        style={{ position: 'relative', zIndex: 2 }}
                                                    >
                                                        {sideImgSrcs[roomIndex][sideIndex] && (
                                                        <img src={sideImgSrcs[roomIndex][sideIndex]} width={90} height={55} />
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
                                                            borderRadius: '5px'
                                                            }}
                                                        >
                                                            <PerspectiveSVG perspectiveWalls={perspectiveWalls} roomData={roomData} roomIndex={roomIndex} sideIndex={sideIndex}
                                                            isPerspectiveUpdated={isPerspectiveUpdated} setIsPerspectiveUpdated={setIsPerspectiveUpdated} />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            <button onClick={() => handleAddGameSide(roomIndex)}>+</button>
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