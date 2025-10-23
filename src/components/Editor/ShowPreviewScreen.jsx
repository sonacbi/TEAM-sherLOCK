import * as fabric from 'fabric';
import { useEffect, useRef, useState } from 'react';

function ShowPreviewScreen ({canvas, canvasData, canvasIndex, remainingScenes, imgs, setSideImgSrcs, setTempCanvasArr}) {
    const tempCanvas = useRef(null);
    const tempCanvasRef = useRef(null);
    const isProcessing = useRef(false);

    const loadTempCanvas = async (data) => {
        if (isProcessing.current) return;
        isProcessing.current = true;

        // 캔버스 초기화
        if (tempCanvas.current) {
            tempCanvas.current.clear();
        } else {
            tempCanvas.current = new fabric.Canvas(tempCanvasRef.current, {
                width: canvas?.width || 900,
                height: canvas?.height || 650,
                backgroundColor: 'white',
            });
        }

        const promises = data.sideData.fabric.map((fabricData) => {
            return new Promise((resolve) => {
                const opt = fabricData.option;
                let shape;
                const baseProps = {
                    ...opt,
                    left: opt.x,
                    top: opt.y,
                };
    
                try {
                    switch (opt.type) {
                        case "textbox":
                            shape = new fabric.Textbox(opt.text, {
                                left: opt.x,
                                top: opt.y,
                                width: opt.width,
                                height: opt.height,
                                angle: opt.angle,
                                scaleX: opt.scaleX,
                                scaleY: opt.scaleY,
                                fill: opt.fill,
                                text: opt.text,
                                textAlign: opt.textAlign,
                                fontFamily: opt.fontFamily,
                                fontSize: opt.fontSize,
                                fontStyle: opt.fontStyle,
                                fontWeight: opt.fontWeight,
                                underline: opt.underline,
                                linethrough: opt.linethrough,
                                strokeWidth: opt.strokeWidth,
                                stroke: opt.stroke,
                                perPixelTargetFind: false,
                                selectable: false,
                                evented: false,
                            });
                            break;
    
                        case "rect":
                            shape = new fabric.Rect(baseProps);
                            break;
    
                        case "triangle":
                            shape = new fabric.Triangle(baseProps);
                            break;
    
                        case "circle":
                            shape = new fabric.Circle(baseProps);
                            break;
    
                        case "image": {
                            const foundImg = imgs.find((img) => img.name === opt.imgName);
                            if (!foundImg) {
                                console.warn(`[${canvasIndex}] 이미지 없음:`, opt.imgName);
                                return resolve(null);
                            }
    
                            const imgElement = new Image();
                            imgElement.src = URL.createObjectURL(foundImg);
                            
                            imgElement.onload = () => {
                                shape = new fabric.Image(imgElement, {
                                    ...baseProps,
                                    selectable: false,
                                    evented: false,
                                });
                                resolve(shape);
                            };
                            
                            imgElement.onerror = () => {
                                console.error(`[${canvasIndex}] 이미지 로드 실패`);
                                resolve(null);
                            };
                            return;
                        }
    
                        case "polygon": {
                            const { shapeType } = opt;
                            let points = [];
                            
                            switch (shapeType) {
                                case "rhombus":
                                    points = [
                                        { x: 50, y: 0 },
                                        { x: 100, y: 50 },
                                        { x: 50, y: 100 },
                                        { x: 0, y: 50 }
                                    ];
                                    break;
                                case "star":
                                    const centerX = 50, centerY = 50;
                                    const outerRadius = 50, innerRadius = 25;
                                    for (let i = 0; i < 10; i++) {
                                        const angle = (Math.PI / 5) * i;
                                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                                        points.push({
                                            x: centerX + radius * Math.cos(angle - Math.PI / 2),
                                            y: centerY + radius * Math.sin(angle - Math.PI / 2),
                                        });
                                    }
                                    break;
                                case "pentagon":
                                    const size = 60, cx = 150, cy = 150;
                                    for (let i = 0; i < 5; i++) {
                                        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                                        points.push({
                                            x: cx + size * Math.cos(angle),
                                            y: cy + size * Math.sin(angle),
                                        });
                                    }
                                    break;
                                case "trapezoid":
                                    points = [
                                        { x: 70, y: 20 },
                                        { x: 130, y: 20 },
                                        { x: 150, y: 120 },
                                        { x: 50, y: 120 },
                                    ];
                                    break;
                            }
                            
                            if (points.length > 0) {
                                shape = new fabric.Polygon(points, baseProps);
                            }
                            break;
                        }
    
                        case "path":
                            if (opt.shapeType === "heart") {
                                shape = new fabric.Path(`
                                    M 10,30 A 20,20 0 0,1 50,30
                                    A 20,20 0 0,1 90,30 Q 90,60 50,90
                                    Q 10,60 10,30 Z
                                `, baseProps);
                            }
                            break;
                    }
    
                    resolve(shape || null);
                } catch (err) {
                    console.error(`[${canvasIndex}] 에러:`, err);
                    resolve(null);
                }
            });
        });
    
        const fabrics = await Promise.all(promises);
        
        fabrics.forEach(fabricObj => {
            if (fabricObj && tempCanvas.current) {
                tempCanvas.current.add(fabricObj);
            }
        });

        tempCanvas.current.requestRenderAll();
        
        // 충분한 대기 시간
        await new Promise(resolve => setTimeout(resolve, 400));

        if (!tempCanvas.current) return;

        const dataURL = tempCanvas.current.toDataURL({
            format: 'jpeg',
            quality: 0.4,
        });

        setSideImgSrcs(prev => {
            const newData = [...prev];
            if (!newData[data.roomIndex]) {
                newData[data.roomIndex] = [];
            }
            newData[data.roomIndex][data.sideIndex] = dataURL;
            return newData;
        });

        // done 처리
        setTempCanvasArr(prev => {
            const newData = [...prev];
            newData[canvasIndex] = { ...newData[canvasIndex], progress: 'done' };
            return newData;
        });

        isProcessing.current = false;
    };
    
    useEffect(() => {
        if (!canvasData || canvasData.progress === 'done') return;
        
        loadTempCanvas(canvasData).catch(err => {
            console.error(`[${canvasIndex}] 처리 실패:`, err);
            isProcessing.current = false;
        });
    }, [canvasData]);

    return (
        <>
        {remainingScenes.length > 0 && (canvasData === null || canvasData === undefined) && (
            <canvas
                ref={tempCanvasRef}
                width={canvas.width || 900}
                height={canvas.height || 650} 
                style={{
                    border: '1px solid blue',
                    display: remainingScenes.length === 0 ? 'none' : 'inherit'
                }}
            />
        )}
        </>
    )
}

export default ShowPreviewScreen;