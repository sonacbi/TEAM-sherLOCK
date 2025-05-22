import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { createRoomFrame, getRotatedRectangleCorners, getFabricObjectCorners } from '../../../modules/handelPolygon';

function Editor({ addTextTrigger, addShapeTrigger, addImageFile, addFrameTrigger, edgeFrameState }) {
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [isReady, setIsReady] = useState(false);
    const [angle, setAngle] = useState(0);
    const [position, setPosition] = useState([220, 120]);
    const [size, setSize] = useState([position[0] + 440, position[1] + 300]);
    const [frontEdge, setFrontEdge] = useState(getRotatedRectangleCorners(220, 120, 220+440, 120+300, 0));
    
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
            setFrontEdge(getRotatedRectangleCorners(...position, ...size, angle))
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

    const addFrame = () => {
        const canvas = canvasInstance.current;
        if (!canvas) return;
        
        const target = canvas.getObjects().find(obj => obj.name === 'SherLockRoomFrame');
        if (target) canvas.remove(target);
        
        const roomFrame = createRoomFrame(
            ...position,
            ...size,
            ...edgeFrameState,
            frontEdge
        );

        canvas.add(roomFrame);
        canvas.sendObjectToBack(roomFrame);
        if (!canvas.getObjects().find(obj => obj.name === 'SherLockRoomController')) {
            canvas.add(roomController);
            canvas.setActiveObject(roomController);
        }
        
        canvas.renderAll();
    };

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