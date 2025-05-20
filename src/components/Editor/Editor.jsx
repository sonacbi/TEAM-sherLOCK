import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

function Editor({ addTextTrigger, addShapeTrigger, addImageFile, addFrameTrigger }) {
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [isReady, setIsReady] = useState(false);

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
        if (isReady && addFrameTrigger) {
            addFrame();
        }
    }, [addFrameTrigger]);

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

        const scale = 0.9;
        const originX = 240; // 기준점 X
        const originY = 100; // 기준점 Y

        // 정면 정보
        const front = {
            left: originX,
            top: originY,
            width: 700 * scale,
            height: 400 * scale,
        };
        const ft = { x: front.left, y: front.top };
        const fb = { x: front.left, y: front.top + front.height };
        const ftR = { x: front.left + front.width, y: front.top };
        const fbR = { x: front.left + front.width, y: front.top + front.height };

        // 바닥의 고정된 바깥쪽 좌표
        const fixedFloorLeft = { x: -320, y: 800 };
        const fixedFloorRight = { x: 1420, y: 800 };

        // 바닥은 정면 하단과 바깥쪽 고정점으로 구성
        const floor = [
            fixedFloorLeft,
            fb,
            fbR,
            fixedFloorRight,
        ];

        // 바닥 좌표에서 fb와 fixedFloorLeft 사이의 y차이로 천장의 y값 보정
        const floorOffsetY = fixedFloorLeft.y - fb.y;

        const ceilingOuterLeft = {
            x: fixedFloorLeft.x,
            y: ft.y - floorOffsetY,
        };
        const ceilingOuterRight = {
            x: fixedFloorRight.x,
            y: ft.y - floorOffsetY,
        };

        // — fabric 객체 생성 —
        const frontRect = new fabric.Rect({
            ...controlStyle,
            left: front.left,
            top: front.top,
            width: front.width,
            height: front.height,
            fill: 'rgba(255, 0, 0, 0.2)',
            stroke: 'red',
            strokeWidth: 2,
            selectable: false,
            hoverCursor: 'default',
        });

        const right = new fabric.Polygon([ftR, ceilingOuterRight, fixedFloorRight, fbR], {
            ...controlStyle,
            fill: 'rgba(0, 255, 0, 0.2)',
            stroke: 'green',
            strokeWidth: 2,
            selectable: false,
            hoverCursor: 'default',
        });

        const left = new fabric.Polygon([ft, ceilingOuterLeft, fixedFloorLeft, fb], {
            ...controlStyle,
            fill: 'rgba(0, 0, 255, 0.2)',
            stroke: 'blue',
            strokeWidth: 2,
            selectable: false,
            hoverCursor: 'default',
        });

        const bottom = new fabric.Polygon(floor, {
            ...controlStyle,
            fill: 'rgba(255, 255, 0, 0.2)',
            stroke: 'orange',
            strokeWidth: 2,
            selectable: false,
            hoverCursor: 'default',
        });

        const top = new fabric.Polygon([ceilingOuterLeft, ft, ftR, ceilingOuterRight], {
            ...controlStyle,
            fill: 'rgba(255, 0, 255, 0.2)',
            stroke: 'purple',
            strokeWidth: 2,
            selectable: false,
            hoverCursor: 'default',
        });

        canvas.add(top, bottom, right, left, frontRect);
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

    return <canvas ref={canvasRef} width={1100} height={650} />;
}

export default Editor;