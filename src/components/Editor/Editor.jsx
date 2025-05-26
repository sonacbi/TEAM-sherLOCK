import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import JSZip from 'jszip';
import { createRoomFrame, getRotatedRectangleCorners, getFabricObjectCorners } from '../../../modules/handlePolygon';
import { GamePnC, Room, Side, Frame, Fabric } from '../../../modules/editor/gamePnC';
import WebGLPerspectiveComponent from './WebGLPerspectiveComponent';

function Editor({ addTextTrigger, addShapeTrigger, addImageFile, addFrameTrigger, edgeFrameState, editorOffset, setEdgeFrameState, saveTool, gameZip, setGameZip, onObjectSelect }) {
    const {game, setGame, room, setRoom, side, setSide, imgs, setImgs} = saveTool;
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [angle, setAngle] = useState(0);
    const [position, setPosition] = useState([220, 120]);
    const [size, setSize] = useState([position[0] + 440, position[1] + 300]);

    //디버깅용
    const containerRef = useRef(null);

    const [offset, setOffset] = useState({ left: 0, top: 0 });
    const [top, left, right, bottom] = edgeFrameState;

useEffect(() => {
  if (containerRef.current) {
    const rect = containerRef.current.getBoundingClientRect();
    setOffset({ left: rect.left, top: rect.top });
  }
}, []);

function isPointInPolygon(point, polygon) {
  let x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    let xi = polygon[i].x, yi = polygon[i].y;
    let xj = polygon[j].x, yj = polygon[j].y;

    let intersect = ((yi > y) !== (yj > y)) &&
                    (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

    // 예: 마우스 클릭 좌표가 window 기준일 때, 화면 내 좌표로 변환
const handleCanvasClick = (e) => {
  const x = e.clientX - offset.left;
  const y = e.clientY - offset.top;
  console.log('보정된 좌표:', x, y);

  walls.forEach(wall => {
    const points = wall.get('points'); // fabric polygon일 경우 get('points')로 접근
    if (isPointInPolygon({ x, y }, points)) {
      console.log('이 벽 안에 클릭됨:', wall.get('wallType'));
    }
  });
};


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

    // 공통 스타일
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

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1100,
            height: 650,
            backgroundColor: 'white',
            selection: true,
            selectionColor: 'rgba(169, 219, 120, 0.3)',
            selectionBorderColor: '#A9DB78',
        });

        canvas.on('object:added', (e) => {
            console.log('added')
            handelSide();
        })
        canvas.on('object:modified', (e) => {
            console.log('modified')
            handelSide();
        })
        canvas.on('object:removed', (e) => {
            console.log('removed')
            handelSide();
        })

        canvasInstance.current = canvas;

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

    const addShape = (shapeType) => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        let shape;
        switch (shapeType) {
            case 'rectangle':
                shape = new fabric.Rect({
                    ...controlStyle,
                    left: 100,
                    top: 100,
                    fill: '#A9DB78',
                    width: 100,
                    height: 100,
                    stroke: 'rgb(0, 140, 26)',
                    strokeWidth: 2,
                    strokeUniform: true,
                });
            break;

            case 'circle':
                shape = new fabric.Circle({
                    ...controlStyle,
                    left: 100,
                    top: 100,
                    fill: '#A9DB78',
                    radius: 50,
                    stroke: 'rgb(0, 140, 26)',
                    strokeWidth: 2,
                    strokeUniform: true,
                });
            break;

            case 'triangle':
                shape = new fabric.Triangle({
                    ...controlStyle,
                    left: 100,
                    top: 100,
                    fill: '#A9DB78',
                    width: 100,
                    height: 100,
                    stroke: 'rgb(0, 140, 26)',
                    strokeWidth: 2,
                    strokeUniform: true,
                });
            break;

            case 'rhombus':
                shape = new fabric.Polygon(
                    [
                        { x: 50, y: 0 },   // top
                        { x: 100, y: 50 }, // right
                        { x: 50, y: 100 }, // bottom
                        { x: 0, y: 50 }    // left
                    ],
                    {
                        ...controlStyle,
                        left: 100,
                        top: 100,
                        fill: '#A9DB78',
                        stroke: 'rgb(0, 140, 26)',
                        strokeWidth: 2,
                        strokeUniform: true,
                    }
                );
            break;

            case 'star':
                const centerX = 50;
                const centerY = 50;
                const outerRadius = 50;
                const innerRadius = 25;
                const points = [];

                for (let i = 0; i < 10; i++) {
                    const angle = (Math.PI / 5) * i;
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    points.push({
                        x: centerX + radius * Math.cos(angle - Math.PI / 2),
                        y: centerY + radius * Math.sin(angle - Math.PI / 2),
                    });
                }

                shape = new fabric.Polygon(points, {
                    ...controlStyle,
                    left: 100,
                    top: 100,
                    fill: '#A9DB78',
                    stroke: 'rgb(0, 140, 26)',
                    strokeWidth: 2,
                    strokeUniform: true,
                });
            break;

            case 'heart':
               const heartPath = `
                    M 10,30
                    A 20,20 0 0,1 50,30
                    A 20,20 0 0,1 90,30
                    Q 90,60 50,90
                    Q 10,60 10,30
                    Z
                `;

                shape = new fabric.Path(heartPath, {
                    ...controlStyle,
                    left: 100,
                    top: 100,
                    fill: '#A9DB78',
                    stroke: 'rgb(0, 140, 26)',
                    strokeWidth: 2,
                    strokeUniform: true,
                    scaleX: 1.3,
                    scaleY: 1.3,
                });
            break;

            case 'pentagon':
                const pentagonSize = 60;
                const pentagonCenterX = 150;
                const pentagonCenterY = 150;
                const pentagonPoints = [];

                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const x = pentagonCenterX + pentagonSize * Math.cos(angle);
                    const y = pentagonCenterY + pentagonSize * Math.sin(angle);
                    pentagonPoints.push({ x, y });
                }

                shape = new fabric.Polygon(pentagonPoints, {
                    ...controlStyle,
                    fill: '#A9DB78',
                    stroke: 'rgb(0, 140, 26)',
                    strokeWidth: 2,
                    strokeUniform: true,
                    left: pentagonCenterX,
                    top: pentagonCenterY,
                    originX: 'center',
                    originY: 'center',
                });
            break;

            case 'trapezoid':
                const topLeftX = 70;
                const topRightX = 130;
                const topY = 20;

                const bottomY = 120;
                const bottomWidth = 100;

                const centerXPos = (topLeftX + topRightX) / 2;  // 변수명 변경

                const bottomLeftX = centerXPos - bottomWidth / 2;
                const bottomRightX = centerXPos + bottomWidth / 2;

                const trapezoidPoints = [
                    { x: topLeftX, y: topY },
                    { x: topRightX, y: topY },
                    { x: bottomRightX, y: bottomY },
                    { x: bottomLeftX, y: bottomY },
                ];

                shape = new fabric.Polygon(trapezoidPoints, {
                    ...controlStyle,
                    fill: '#A9DB78',
                    stroke: 'rgb(0, 140, 26)',
                    strokeWidth: 2,
                    strokeUniform: true,
                    left: 150,
                    top: 150,
                    originX: 'center',
                    originY: 'center',
                });
            break;
            // 필요시 다른 도형 추가
            default:
            return;
        }

        canvas.add(shape);
        canvas.setActiveObject(shape);
        canvas.renderAll();
    };

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

    const handelSide = () => {
        const canvas = canvasInstance.current;
        const updatedFabric = [];

        canvas._objects.forEach((data) => {
            if (data.name == 'SherLockRoomController' || data.name == 'SherLockRoomFrame') return;

            updatedFabric.push(
                new Fabric({
                    name: data?.name,
                    option: {
                        left: Number(data?.left.toFixed(2)),
                        top: Number(data?.top.toFixed(2)),
                        width: Number(data?.width.toFixed(2)),
                        height: Number(data?.height.toFixed(2)),
                        angle: Number(data?.angle.toFixed(2)),
                        scaleX: data?.scaleX,
                        scaleY: data?.scaleY,
                        fill: data?.fill,
                        fillRule: data?.fillRule,
                        backgroundColor: data?.backgroundColor,
                        borderColor: data?.borderColor,
                        text: data?.text,
                        textAlign: data?.textAlign,
                        textBackgroundColor: data?.textBackgroundColor,
                        textLines: data?.textLines,
                        fontFamily: data?.fontFamily,
                        fontSize: data?.fontSize,
                        fontStyle: data?.fontStyle,
                        fontWeight: data?.fontWeight,
                        strokeWidth: data?.strokeWidth,
                        stroke: data?.stroke,
                        strokeUniform: data?.strokeUniform,
                        editable: data?.editable,
                        name: data?.name,
                        type: data?.type,
                        shapeType: data?.shapeType
                    },
                    event: data?.event
                })
            );
        });

        setSide(prevSide => {
            const updatedSide = new Side({
                name: prevSide.name,
                description: prevSide.description,
                frame: prevSide.frame,
                fabric: [...updatedFabric]
            });

            setRoom(prevRoom => {
                const newRoom = new Room({
                ...prevRoom,
                side: prevRoom.side.map(s =>
                    s.name === updatedSide.name ? updatedSide : s
                )
                });
                return newRoom;
            });

            return updatedSide;
        });
    };
    
    const loadGame = (game) => {
        console.log('loadGame - game', game)
        const canvas = canvasInstance.current;
        game.room.forEach((roomData, roomIndex) => {
            roomData.side.forEach((sideData, sideIndex) => {
                canvas.clear();
                new Promise((resolve, reject) => {
                    resolve(sideData);
                })
                .then(data => {
                    roomController.left = data.frame.x;
                    roomController.top = data.frame.y;
                    roomController.width = data.frame.width;
                    roomController.height = data.frame.height;
                    return data;
                })
                .then(data => {
                    setPosition([data.frame.x, data.frame.y])
                    setSize([data.frame.width, data.frame.height])
                    setAngle(data.frame.angle)
                    setEdgeFrameState([data.frame.top, data.frame.left, data.frame.right, data.frame.bottom])
                })
                .finally(addFrame());
                sideData.fabric.forEach((fabricData, fabricIndex) => {
                    console.log('fabricData',fabricData)
                    switch (fabricData.option.type) {
                        case "textbox":
                            const textbox = new fabric.Textbox(fabricData.option.text, {
                                ...controlStyle,
                                left: fabricData.option.left,
                                top: fabricData.option.top,
                                width: fabricData.option.width,
                                height: fabricData.option.height,
                                angle: fabricData.option.angle,
                                scaleX: fabricData.option.scaleX,
                                scaleY: fabricData.option.scaleY,
                                fill: fabricData.option.fill,
                                fillRule: fabricData.option.fillRule,
                                backgroundColor: fabricData.option.backgroundColor,
                                borderColor: fabricData.option.borderColor,
                                text: fabricData.option.text,
                                textAlign: fabricData.option.textAlign,
                                textBackgroundColor: fabricData.option.textBackgroundColor,
                                textLines: fabricData.option.textLines,
                                fontFamily: fabricData.option.fontFamily,
                                fontSize: fabricData.option.fontSize,
                                fontStyle: fabricData.option.fontStyle,
                                fontWeight: fabricData.option.fontWeight,
                                strokeWidth: fabricData.option.strokeWidth,
                                stroke: fabricData.option.stroke,
                                strokeUniform: fabricData.option.strokeUniform,
                                editable: fabricData.option.editable,
                                name: fabricData.option.name,
                                shapeType: fabricData.option.shapeType,
                            });
                            canvas.add(textbox);
                            canvas.setActiveObject(textbox);
                            break;
                        case "line":
                            const line = new fabric.Line({...controlStyle, ...fabricData.option});
                            canvas.add(line);
                            canvas.setActiveObject(line);
                            break;
                        case "rect":
                            const rect = new fabric.Rect({...controlStyle, ...fabricData.option});
                            canvas.add(rect);
                            canvas.setActiveObject(rect);
                            break;
                        case "triangle":
                            const triangle = new fabric.Triangle({...controlStyle, ...fabricData.option});
                            canvas.add(triangle);
                            canvas.setActiveObject(triangle);
                            break;
                        case "circle":
                            const circle = new fabric.Circle({...controlStyle, ...fabricData.option});
                            canvas.add(circle);
                            canvas.setActiveObject(circle);
                            break;
                        case "image":
                            const foundImg = imgs.find(img => img.name === fabricData.option.name);
                            console.log('foundImg',foundImg)
                            if (foundImg) {
                                const reader = new FileReader();
                                reader.onload = function (e) {
                                    if (!canvasInstance.current) return;
                                    const imgElement = new Image();
                                    imgElement.src = e.target.result;
                                    imgElement.onload = () => {
                                        // const warpedCanvas = warpImageToTrapezoid(imgElement, 40);
                                        // const fabricImage = new fabric.Image(warpedCanvas, {
                                        const fabricImage = new fabric.Image(imgElement, {
                                            ...controlStyle, ...fabricData.option
                                        });
                                        canvasInstance.current.add(fabricImage);
                                        canvasInstance.current.setActiveObject(fabricImage);
                                    };
                                    imgElement.onerror = () => {
                                        console.error('이미지 로드 실패');
                                    };
                                };
                                reader.onerror = function () {
                                    console.error('파일 읽기 실패');
                                };
                                reader.readAsDataURL(foundImg);
                            } else {
                                console.warn('이미지 소스를 찾을 수 없습니다.', fabricData.option.name);
                            }
                            break;
                        case "polygon":
                            const polygon = new fabric.Polygon({...controlStyle, ...fabricData.option});
                            canvas.add(polygon);
                            canvas.setActiveObject(polygon);
                            break;
                        case "path":
                            const path = new fabric.Path({...controlStyle, ...fabricData.option});
                            canvas.add(path);
                            canvas.setActiveObject(path);
                            break;
                        default:
                            console.error(`${fabricData.option.type} 잘못된 도형입니다`)
                            break;
                    }
                    canvas.renderAll();
                })
            })
        })
        console.log(canvas)
    }

    
    // const loadGameZip = async (file) => {
    //     if (file && file.name.endsWith('.zip')) {
    //         const zip = await JSZip.loadAsync(file);
    //         let imgFiles = [];
    //         // zip 파일 내의 파일들을 순차적으로 확인
    //         new Promise((resolve, reject) => {
    //             let gameData;
    //             zip.forEach((relativePath, zipEntry) => {
    //                 if (zipEntry.name.endsWith('.json')) {
    //                     // JSON 파일 처리
    //                     zipEntry.async('string').then((content) => {
    //                         gameData = new GamePnC(JSON.parse(content));
    //                         setGame(gameData);
    //                     });
    //                 } else if (zipEntry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    //                     // 이미지 파일 처리
    //                     zipEntry.async('blob').then((blob) => {
    //                         const file = new File([blob], zipEntry.name);
    //                         imgFiles.push(file);
    //                         setImgs(prev => [...prev, file]);
    //                     });
    //                 }
    //             });
    //             resolve(gameData);
    //         })
    //         .then(data => {
    //             console.log('promise imgs',imgs)
    //             loadGame(data)
    //         });
    //     }
    // }

    const loadGameZip = async (file) => {
        if (file && file.name.endsWith('.zip')) {
            const zip = await JSZip.loadAsync(file);

            let gameData = null;
            const imagePromises = [];

            zip.forEach((relativePath, zipEntry) => {
            if (zipEntry.name.endsWith('.json')) {
                imagePromises.push(
                zipEntry.async('string').then((content) => {
                    gameData = new GamePnC(JSON.parse(content));
                })
                );
            } else if (zipEntry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                const imagePromise = zipEntry.async('blob').then((blob) => {
                return new File([blob], zipEntry.name);
                });
                imagePromises.push(imagePromise);
            }
            });

            const results = await Promise.all(imagePromises);
            const imgFiles = results.filter(f => f instanceof File);

            setGame(gameData);
            setImgs(imgFiles);

            // 이미지와 게임 데이터를 모두 셋업한 후 준비 완료 표시
            setIsReadyToLoad(true);
        }
    };

    useEffect(() => {
        if (isReadyToLoad && game) {
            loadGame(game);
            setIsReadyToLoad(false);
        }
    }, [isReadyToLoad, game]);

    useEffect(() => {
        if (isReady && gameZip) {
            loadGameZip(gameZip);
            (false);
        }
    }, [gameZip]);

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

                setImageUrl(e.target.result); // 이미지 URL 상태 저장

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

    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Delete') {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    if (activeObject instanceof fabric.ActiveSelection) {
                        activeObject.forEachObject(obj => {
                            canvas.remove(obj);
                        });
                        canvas.discardActiveObject();
                    } else {
                        canvas.remove(activeObject);
                        canvas.discardActiveObject();
                    }
                    canvas.renderAll();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isReady]);

    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const handleWheel = (e) => {
            if (!e.ctrlKey) return;
            e.preventDefault();

            let zoom = canvas.getZoom();
            zoom *= e.deltaY > 0 ? 0.9 : 1.1;
            zoom = Math.min(Math.max(zoom, 0.5), 5);

            canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
            canvas.renderAll();
        };

        const upperCanvas = canvas.upperCanvasEl;
        if (upperCanvas) {
            upperCanvas.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (upperCanvas) {
                upperCanvas.removeEventListener('wheel', handleWheel);
            }
        };
    }, [isReady]);

    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        // 캔버스 내부 클릭 시 플래그 설정
        let isCanvasClicked = false;

        const onCanvasMouseDown = () => {
            isCanvasClicked = true;
        };

        const onDocumentMouseDown = () => {
            if (!isCanvasClicked) {
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            onObjectSelect(null);
            }
            isCanvasClicked = false;
        };

        canvas.on('mouse:down', onCanvasMouseDown);
        document.addEventListener('mousedown', onDocumentMouseDown);

        return () => {
            canvas.off('mouse:down', onCanvasMouseDown);
            document.removeEventListener('mousedown', onDocumentMouseDown);
        };
    }, []);

    function warpImageToTrapezoid(image, topInset = 40) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const w = image.width;
        const h = image.height;
        canvas.width = w;
        canvas.height = h;

        // Draw image to trapezoid by using transformation matrix (fake 2D skew)
        ctx.save();
        ctx.setTransform(
            (w - topInset * 2) / w, // scaleX
            t001,
            topInset / h, // skewX
            1, // scaleY
            topInset, // translateX
            t001 // translateY
        );
        ctx.drawImage(image, 0, 0);
        ctx.restore();

        return canvas;
    }

    // 벽 객체의 4개 꼭지점 좌표를 canvas 좌표계 기준으로 계산하는 함수
    function getWallVertices(wall) {
        if (!wall || !wall.get('points')) return [];

        const points = wall.get('points'); // polygon의 로컬 좌표 (path 좌표)
        const matrix = wall.calcTransformMatrix(); // 벽 객체의 전체 변환 행렬 (이동, 회전, 스케일 포함)

        // polygon의 기준점인 pathOffset (left/top 기준 보정값)
        const offsetX = wall.pathOffset?.x || 0;
        const offsetY = wall.pathOffset?.y || 0;

        // 각 로컬 좌표에서 pathOffset 보정 후, 전체 변환 행렬을 적용하여 캔버스 좌표계로 변환
        return points.map(p => {
            const localPoint = new fabric.Point(p.x - offsetX, p.y - offsetY);
            const transformed = fabric.util.transformPoint(localPoint, matrix);
            return transformed;
        });
    }

    // 사각형(rect) 객체의 4개 꼭지점 좌표를 계산하는 함수
    function getRectVertices(rect) {
        const left = rect.left;
        const top = rect.top;
        const width = rect.width * rect.scaleX;   // 스케일 적용된 실제 너비
        const height = rect.height * rect.scaleY; // 스케일 적용된 실제 높이

        // 좌상단, 우상단, 우하단, 좌하단 꼭지점 배열 리턴
        return [
            new fabric.Point(left, top),
            new fabric.Point(left + width, top),
            new fabric.Point(left + width, top + height),
            new fabric.Point(left, top + height),
        ];
    }

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
        console.log(obj.wallType, vertices);
    });

    // 꼭지점에 오프셋(이동)과 회전을 적용하는 함수
    function applyOffsetToVertices(vertices, wall) {
        if (!vertices || vertices.length === 0) return [];

        const offsetX = wall.left || 0;    // 벽 객체의 캔버스 좌표 X
        const offsetY = wall.top || 0;     // 벽 객체의 캔버스 좌표 Y
        const angle = wall.angle || 0;     // 벽 객체의 회전 각도 (도 단위)

        // 점 하나를 주어진 각도만큼 회전시키는 내부 함수 (rad 단위)
        function rotatePoint(point, angleRad) {
            const cos = Math.cos(angleRad);
            const sin = Math.sin(angleRad);
            return new fabric.Point(
                point.x * cos - point.y * sin,
                point.x * sin + point.y * cos
            );
        }

        const angleRad = fabric.util.degreesToRadians(angle);

        // 각 꼭지점에 대해 회전 후, offset(이동) 적용하여 캔버스 좌표계로 변환
        return vertices.map(pt => {
            const rotated = rotatePoint(pt, angleRad);
            return new fabric.Point(rotated.x + offsetX, rotated.y + offsetY);
        });
    }

    // 캔버스에서 벽 객체들만 추출하는 함수
    function getWallsFromCanvas(canvas) {
        if (!canvas) return [];

        const objects = canvas.getObjects();
        let walls = [];

        console.log('캔버스 전체 객체 개수:', objects.length);

        objects.forEach((obj, idx) => {
            console.log(`객체[${idx}]: type=${obj.type}, name=${obj.name}, wallType=${obj.get('wallType')}`);

            // 그룹 객체인 경우, 그룹 내부 객체 중 벽 유형에 해당하는 객체만 필터링
            if (obj.type === 'group') {
                const groupWalls = obj._objects.filter(o =>
                    ['front', 'bottom', 'left', 'right', 'top'].includes(o.get('wallType'))
                );
                console.log(`  그룹 내부 벽 객체 개수: ${groupWalls.length}`);

                groupWalls.forEach((w, i) => {
                    console.log(`    벽[${i}]: type=${w.type}, wallType=${w.get('wallType')}`);
                });

                walls = walls.concat(groupWalls);
            } else {
                // 그룹이 아닌 단일 객체 중 벽 유형에 해당하는 경우 바로 추가
                if (['front', 'bottom', 'left', 'right', 'top'].includes(obj.get('wallType'))) {
                    console.log(`  그룹 밖 벽 객체 발견: wallType=${obj.get('wallType')}`);
                    walls.push(obj);
                }
            }
        });

        console.log('최종 벽 객체 개수:', walls.length);
        walls.forEach((w, i) => {
            console.log(`벽[${i}]: type=${w.type}, wallType=${w.get('wallType')}`);
        });

        return walls;
    }

    // React 훅에서 드래그 상태 저장용 useRef
    const isDragging = useRef(false);
    // 현재 마우스가 호버중인 벽 객체 저장 (이벤트 핸들러 전용)
    const hoveredWallLocal = useRef(null);
    // 원래 스타일을 저장하는 Map (객체별)
    const originalStyles = useRef(new Map());

    // 호버 상태가 끝났을 때 원래 스타일로 복원하는 함수
    function restoreWallStyle() {
        if (!hoveredWallLocal.current) return;
        const original = originalStyles.current.get(hoveredWallLocal.current);
        if (original) {
            hoveredWallLocal.current.set({
                fill: original.fill,
                stroke: original.stroke,
            });
            originalStyles.current.delete(hoveredWallLocal.current);
            canvasInstance.current.renderAll();
        }
    }

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
            restoreWallStyle();

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
                restoreWallStyle();

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
                console.log('원본 vertices:', vertices);

                // 2) 벽 위치, 회전값 가져오기
                const left = wallUnderPointer.left || 0;
                const top = wallUnderPointer.top || 0;
                const angle = wallUnderPointer.angle || 0;

                // 3) 꼭지점 좌표에 오프셋(회전+이동) 적용
                const offsetVertices = applyOffsetToVertices(vertices, wallUnderPointer);
                console.log('offsetVertices:', offsetVertices);

                setHoveredWallVertices(vertices);

                canvas.renderAll();
            }

            // 벽 객체가 없으면 호버 상태 초기화
            if (!wallUnderPointer && hoveredWallLocal.current) {
                restoreWallStyle();
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



    return (
        <div
        style={{ position: 'relative' }}
        ref={containerRef}
        onClick={handleCanvasClick} // 여기로 옮김
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