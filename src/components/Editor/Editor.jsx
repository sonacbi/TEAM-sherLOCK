import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

import { createRoomFrame } from '../../../modules/handlePolygon';
import { Frame } from '../../../modules/editor/gamePnC';
import { handleSide, loadGame, loadGameZip } from '../../../modules/editor/handleGame';
import WebGLPerspectiveComponent from './WebGLPerspectiveComponent';
import { getShapeByType } from './getShapeByType';
import { useDeleteKeyHandler, useCanvasZoom, useCanvasClickDeselect } from './useCanvasHandlers';
import { useWallHoverHandler } from './useWallHoverhandler';
import { getWallsFromCanvas, getWallVertices, getRectVertices } from './perspectiveBackground';

function Editor({ addTextTrigger, addShapeTrigger, addImageFile, addFrameTrigger, edgeFrameState, setEdgeFrameState, saveTool, gameZip, onObjectSelect, selectedTool }) {
    const {game, setGame, setRoom, setSide, imgs, setImgs} = saveTool;
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
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
    const [perspective, setPerspective] = useState({
        front: {}, left: {}, right: {}, top: {}, bottom: {} });
    // 현재 호버된 벽 객체 상태
    const [hoveredWall, setHoveredWall] = useState(null);
    // 현재 호버된 벽의 꼭지점 좌표 (WebGL 컴포넌트 전달용)
    const [hoveredWallVertices, setHoveredWallVertices] = useState([]);


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
        console.log('[useMemo] items:', result);
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

        canvas.on('object:added', (e) => {
            console.log('added')
            handleSide(canvasInstance.current, setSide, setRoom);
        })
        canvas.on('object:modified', (e) => {
            console.log('modified')
            handleSide(canvasInstance.current, setSide, setRoom);
        })
        canvas.on('object:removed', (e) => {
            console.log('removed')
            handleSide(canvasInstance.current, setSide, setRoom);
        })

        // 초기 textbox 추가
        const textbox = new fabric.Textbox('텍스트를 입력하세요.', {
            ...controlStyle,
            fontSize: 50,
            fill: '#333',
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

        setIsReady(true);
        return () => canvas.dispose();
    }, []);
    //                           -------------------------------------(section 5) 
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
            fill: '#333',
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
        setSide(prev => ({
            ...prev,
            frame: new Frame({
                x: Number(position[0].toFixed(2)),
                y: Number(position[1].toFixed(2)),
                width: Number(size[0].toFixed(2)),
                height: Number(size[1].toFixed(2)),
                angle: Number(angle.toFixed(2)),
                top: Number(edgeFrameState[0].toFixed(2)),
                left: Number(edgeFrameState[1].toFixed(2)),
                right: Number(edgeFrameState[2].toFixed(2)),
                bottom: Number(edgeFrameState[3].toFixed(2))
            })
        }));

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
            loadGame(game, imgs, canvasInstance.current, controlStyle, roomController, setPosition, setSize, setAngle, setEdgeFrameState, addFrame);
            setIsReadyToLoad(false);
        }
    }, [isReadyToLoad, game]);

    useEffect(() => {
        if (isReady && gameZip) {
            loadGameZip(gameZip, setGame, setImgs, setIsReadyToLoad);
            (false);
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
                    // const warpedCanvas = warpImageToTrapezoid(imgElement, 40);

                    // const fabricImage = new fabric.Image(warpedCanvas, {
                    const fabricImage = new fabric.Image(imgElement, {
                        ...controlStyle,
                        left: 150,
                        top: 150,
                        scaleX: 0.4,
                        scaleY: 0.4,
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

    const { previewPerspective } = useWallHoverHandler({ canvasInstance, hoveredWallLocal, originalStyles, isDragging, setHoveredWall,
        position, size, edgeFrameState, angle,
        setHoveredWallVertices, selectedTool, perspective, setPerspective, 
    });

    useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas) return;

    const updatePerspectiveVertices = () => {
        const walls = getWallsFromCanvas(canvas);
        const rects = canvas.getObjects().filter(obj => obj.type === 'rect');

        if (!walls.length && !rects.length) return;

        setPerspective(prev => {
        const updatedPerspective = { ...prev };

        walls.forEach(wall => {
            const wallType = wall.get('wallType');
            const vertices = getWallVertices(wall);

            if (vertices.length) {
            updatedPerspective[wallType] = {
                ...(prev[wallType] || {}),
                vertices: [...vertices],
            };

            //   console.log(`[mouse:up] perspective 저장됨: ${wallType}`, vertices);
            }
        });

        //   // 배열 형태로 바꾸어서 useMemo 용 예시 로그 출력
        //   const itemsArray = Object.entries(updatedPerspective).map(([key, val]) => ({
        //     wallType: key,
        //     vertices: val.vertices || [],
        //     imageUrl: val.imageUrl || '',
        //   }));

        //   console.log('[useMemo] items:', itemsArray);

        return updatedPerspective;
        });
    };

    canvas.on('object:added', updatePerspectiveVertices);
    canvas.on('object:modified', updatePerspectiveVertices);
    canvas.on('object:removed', updatePerspectiveVertices);

    updatePerspectiveVertices();

    return () => {
        canvas.off('object:added', updatePerspectiveVertices);
        canvas.off('object:modified', updatePerspectiveVertices);
        canvas.off('object:removed', updatePerspectiveVertices);
    };
    }, []);

    // 원근법 기반 프레임 왜곡 배경 ----------------------------------(section 16)

    // ↓ 원근법 디버깅을 위해 일부 레이어 겹침 -----------------------(section 17)
    return (
        <div ref={containerRef} style={{ position: 'relative', width: 1100, height: 650 }}>
            <canvas
            ref={canvasRef}
            id="my-canvas"
            width={1100}
            height={650}
            style={{ position: 'absolute', top: 0, left: 0, zIndex: 2,}}
            />

            {perspectiveWalls.map((wall) => {
            const isHovered = hoveredWall && hoveredWall.wallType === wall.wallType;
            return (
                <div
                key={wall.wallType}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 1100,
                    height: 650,
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
            if (!vertices || vertices.length === 0) return null;

            return (
                <div
                key={`preview-${wallType}`}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: 1100,
                    height: 650,
                    pointerEvents: 'none',
                    zIndex: 3, // 실제 perspective 위에 렌더링
                    opacity: 0.5, // 미리보기는 반투명
                }}
                >
                <WebGLPerspectiveComponent
                    items={[{
                    imageUrl,
                    vertices,
                    wallType,
                    }]}
                    width={1100}
                    height={650}
                />
                </div>
            );
            })}
        </div>
    );


}

export default Editor;