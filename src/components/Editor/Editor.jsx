import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import JSZip from 'jszip';
import { createRoomFrame, getRotatedRectangleCorners, getFabricObjectCorners } from '../../../modules/handlePolygon';
import { GamePnC, Room, Side, Frame, Fabric } from '../../../modules/editor/gamePnC';

function Editor({ addTextTrigger, addShapeTrigger, addImageFile, addFrameTrigger, edgeFrameState, setEdgeFrameState, saveTool, gameZip, setGameZip }) {
    const {game, setGame, room, setRoom, side, setSide, imgs, setImgs} = saveTool;
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [angle, setAngle] = useState(0);
    const [position, setPosition] = useState([220, 120]);
    const [size, setSize] = useState([position[0] + 440, position[1] + 300]);
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
        canvas.setActiveObject(textbox);
        canvas.renderAll();

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
        if (isReady) addShape();
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

    const addShape = () => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const rect = new fabric.Rect({
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

        canvas.add(rect);
        canvas.setActiveObject(rect);
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

    return <canvas ref={canvasRef} width={1100} height={650} />;
}

export default Editor;