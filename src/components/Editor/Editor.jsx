import React, { useEffect, useRef, useState } from 'react';
import * as fabric from 'fabric';

function Editor({ addTextTrigger, addShapeTrigger, addImageFile }) {
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