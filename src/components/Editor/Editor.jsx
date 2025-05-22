import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';
import { createRoomFrame } from '../../../modules/handelPolygon';

function Editor({ addTextTrigger, addShapeTrigger, addImageFile, addFrameTrigger, roomFrameState }) {
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
        if (isReady && addShapeTrigger) {
            addShape(addShapeTrigger);
        }
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

        const roomFrame = createRoomFrame(...roomFrameState);
        roomFrame.forEach((data) => {
            canvas.add(data);
        })

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