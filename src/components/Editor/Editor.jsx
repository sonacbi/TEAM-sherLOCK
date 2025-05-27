import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

import { createRoomFrame } from '../../../modules/handlePolygon';
import { Frame } from '../../../modules/editor/gamePnC';
import { handleSide, loadGame, loadGameZip } from '../../../modules/editor/handleGame';
import WebGLPerspectiveComponent from './WebGLPerspectiveComponent';
import { getShapeByType } from './getShapeByType';
import { useDeleteKeyHandler, useCanvasZoom, useCanvasClickDeselect } from './useCanvasHandlers';
import { getWallVertices, getRectVertices, applyOffsetToVertices, getWallsFromCanvas, restoreWallStyle} from './perspectiveBackground'

function Editor({ addTextTrigger, addShapeTrigger, addImageFile, addFrameTrigger, edgeFrameState, setEdgeFrameState, saveTool, gameZip, onObjectSelect }) {
    const {game, setGame, setRoom, setSide, imgs, setImgs} = saveTool;
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [angle, setAngle] = useState(0);
    const [position, setPosition] = useState([220, 120]);
    const [size, setSize] = useState([position[0] + 440, position[1] + 300]);
    const isDragging = useRef(false); // React 훅에서 드래그 상태 저장용 useRef
    const hoveredWallLocal = useRef(null); // 현재 마우스가 호버중인 벽 객체 저장 (이벤트 핸들러 전용)
    const originalStyles = useRef(new Map()); // 호버된 벽의 원래 스타일을 저장하는 Map (객체별)


    // 프레임 원근법 배경 왜곡 디버깅 코드 + 상태 관리 코드 ------------ (section 1) (정다정)
    //디버깅용
    const containerRef = useRef(null);

    // 3D 배경 처리용
    // 벽 객체 목록 상태
    const [walls, setWalls] = useState([]);
    // 현재 호버된 벽 객체 상태
    const [hoveredWall, setHoveredWall] = useState(null);
    // 현재 호버된 벽의 꼭지점 좌표 (WebGL 컴포넌트 전달용)
    const [hoveredWallVertices, setHoveredWallVertices] = useState([]);
    // 이미지 URL (드래그 중인 이미지)
    const [imageUrl, setImageUrl] = useState(null);
    const [isReadyToLoad, setIsReadyToLoad] = useState(false);

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
    const roomController = new fabric.Rect({
        ...controlStyle,
        left: 220,
        top: 120,
        fill: 'rgba(255, 0, 0, 0.2)',
        strokeWidth: 2,
        stroke: 'red',
        name: "SherLockRoomController",
    });
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
    // ---------------------------------------------------------------(section 3) (노은성)
    // 캔버스 랜더링 기본값 세팅 -------------------------------------(section 4) ?
    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1100,
            height: 650,
            backgroundColor: 'white',
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
        canvas.sendObjectToBack(roomFrame);
        
        canvas.renderAll();
    };

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

                setImageUrl(e.target.result); // 이미지 URL 상태 저장 (프레임 조작용- 추가예정✨)

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
                        name: addImageFile.name
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

    // 방 프레임 그룹 생성 후, 내부 객체들을 순회하며 각 객체의 꼭지점 구하기
    const roomFrameGroup = createRoomFrame(
        ...position,
        ...size,
        ...edgeFrameState,
        angle
    );

    roomFrameGroup.getObjects().forEach((obj) => {
        let vertices;
        if (obj.type === 'polygon') {
            // 폴리곤은 points 배열을 fabric.Point로 변환
            vertices = obj.points.map(pt => new fabric.Point(pt.x, pt.y));
        } else if (obj.type === 'rect') {
            // 사각형은 getRectVertices 함수 사용
            vertices = getRectVertices(obj);
        }
        // console.log(obj.wallType, vertices);
    });

    // 캔버스 이벤트 등록 및 상태 관리용 useEffect
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        // 초기 벽 목록을 상태로 세팅
        setWalls(getWallsFromCanvas(canvas));

        // 오브젝트 이동 시작 시 드래그 상태 true
        const onObjectMoving = () => {
            isDragging.current = true;
        };

        // 마우스 버튼 떼면 드래그 종료, 스타일 복원
        const onMouseUp = () => {
            isDragging.current = false;
            restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);

            // 드롭 시점에서 hoveredWallLocal 존재하면
            // WebGL 4점 왜곡 확정 로직 가능 (추가 처리 위치)
        };

        // 마우스 이동 시, 드래그 중이면 벽 위에 마우스가 있는지 체크
        const onMouseMove = opt => {
            if (!isDragging.current) return;

            const pointer = canvas.getPointer(opt.e);
            const currentWalls = getWallsFromCanvas(canvas);

            // 마우스 위치가 포함된 벽 객체 찾기 (containsPoint 함수 사용)
            const wallUnderPointer = currentWalls.find(wall => wall.containsPoint(pointer));

            if (wallUnderPointer && wallUnderPointer !== hoveredWallLocal.current) {
                // 이전 호버 스타일 복원
                restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);

                 // 새 호버 객체로 교체
                hoveredWallLocal.current = wallUnderPointer;

                // 새로 호버된 객체 스타일 원본 저장
                if (!originalStyles.current.has(wallUnderPointer)) {
                    originalStyles.current.set(wallUnderPointer, {
                        fill: wallUnderPointer.fill,
                        stroke: wallUnderPointer.stroke,
                    });
                }

                // 새 호버된 벽 객체 스타일 변경 (하이라이트)
                wallUnderPointer.set({
                    fill: 'rgba(180,180,180,0.7)',
                    stroke: '#555',
                });

                hoveredWallLocal.current = wallUnderPointer;
                setHoveredWall(wallUnderPointer);

                // 1) 벽의 로컬 좌표 꼭지점 배열 계산
                const vertices = getWallVertices(wallUnderPointer);

                // 3) 꼭지점 좌표에 오프셋(회전+이동) 적용
                // const offsetVertices = applyOffsetToVertices(vertices, wallUnderPointer);
                // console.log('offsetVertices:', offsetVertices);

                setHoveredWallVertices(vertices);

                canvas.renderAll();
            }

            // 벽 객체가 없으면 호버 상태 초기화
            if (!wallUnderPointer && hoveredWallLocal.current) {
                restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);
                hoveredWallLocal.current = null;
                setHoveredWall(null);
                setHoveredWallVertices([]);
            }
        };

        // 이벤트 등록
        canvas.on('object:moving', onObjectMoving);
        canvas.on('mouse:up', onMouseUp);
        canvas.on('mouse:move', onMouseMove);

        // 클린업 함수 (컴포넌트 언마운트 시 이벤트 제거)
        return () => {
            canvas.off('object:moving', onObjectMoving);
            canvas.off('mouse:up', onMouseUp);
            canvas.off('mouse:move', onMouseMove);
        };
    }, [edgeFrameState]); // edgeFrameState 변경 시 재실행
    // 원근법 기반 프레임 왜곡 배경 ----------------------------------(section 16)

    // ↓ 원근법 디버깅을 위해 일부 레이어 겹침 -----------------------(section 17)
    return (
        <div 
        style={{ position: 'relative' }}
        ref={containerRef}
        >
            <canvas
                ref={canvasRef}
                id="my-canvas"
                width={1100}
                height={650}
                style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            />

            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 2,
                    pointerEvents: 'none',
                    width: 1100,
                    height: 650,
                }}
            >
                <WebGLPerspectiveComponent
                    vertices={hoveredWallVertices}
                    imageUrl={imageUrl}
                    wallType={hoveredWall ? hoveredWall.get('wallType') : null}
                    width={1100}
                    height={650}
                />
            </div>
        </div>
);

}

export default Editor;