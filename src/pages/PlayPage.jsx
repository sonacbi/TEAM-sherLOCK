import React, { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import * as fabric from 'fabric';

import { GamePnC } from '../../modules/editor/gamePnC';
import { loadGameZip } from '../../modules/editor/handleGame';
import '../styles/PlayPage.css';

function PlayPage() {
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [game, setGame] = useState(new GamePnC({}));
    const [imgs, setImgs] = useState([]);
    const [isReadyToLoad, setIsReadyToLoad] = useState(false);
    const [gameZip, setGameZip] = useState(null);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1100,
            height: 650,
            selection: false,
            hoverCursor: null,
        })
        canvasInstance.current = canvas;

        return () => canvas.dispose();
    }, [])

    const executeGameEvent = (event) => {
        const [eventType] = Object.keys(event);
        switch (eventType) {
            case "move":
                loadGamePlay(event.move.room, event.move.side)
                break;
            case "getObj":
                break;
            case "setObj":
                break;
            case "dropObj":
                break;
            case "getItem":
                break;
            case "dropItem":
                break;
            case "startTime":
                break;
            case "endTime":
                break;
            case "startSound":
                break;
            case "endSound":
                break;
            case "save":
                break;
            default:
                console.warn('잘못된 이벤트입니다', event);
                break;
        }
    }

    const loadGamePlay = async (roomIndex, sideIndex) => {
        const canvas = canvasInstance.current;
        await canvas.clear();

        const promises = game.room[roomIndex].side[sideIndex].fabric.map(shape => {
            return new Promise(resolve => {
                const opt = shape.option;
                let fabricObj;
                const baseProps = {
                    ...opt,
                    left: opt.x,
                    top: opt.y,
                    perPixelTargetFind: true,
                };

                try {
                    switch (opt.type) {
                        case "textbox":
                            fabricObj = new fabric.Textbox(opt.text, {
                                left: opt.x,
                                top: opt.y,
                                width: opt.width,
                                height: opt.height,
                                angle: opt.angle,
                                scaleX: opt.scaleX,
                                scaleY: opt.scaleY,
                                fill: opt.fill,
                                fillRule: opt.fillRule,
                                text: opt.text,
                                textAlign: opt.textAlign,
                                textBackgroundColor: opt.textBackgroundColor,
                                textLines: opt.textLines,
                                fontFamily: opt.fontFamily,
                                fontSize: opt.fontSize,
                                fontStyle: opt.fontStyle,
                                fontWeight: opt.fontWeight,
                                strokeWidth: opt.strokeWidth,
                                stroke: opt.stroke,
                                strokeUniform: opt.strokeUniform,
                                name: opt.name,
                                shapeType: opt.shapeType,
                                gameEvent: opt.gameEvent,
                            });
                            break;
                        case "line":
                            fabricObj = new fabric.Line(baseProps);
                            break;
                        case "rect":
                            fabricObj = new fabric.Rect(baseProps);
                            break;
                        case "triangle":
                            fabricObj = new fabric.Triangle(baseProps);
                            break;
                        case "circle":
                            fabricObj = new fabric.Circle(baseProps);
                            break;
                        case "image":
                            const foundImg = imgs.find(img => img.name === opt.name);
                            if (!foundImg) {
                                console.warn('이미지 소스를 찾을 수 없습니다.', opt.name);
                                return resolve();
                            }

                            const reader = new FileReader();
                            reader.onload = function (e) {
                                const imgElement = new Image();
                                imgElement.src = e.target.result;
                                imgElement.onload = () => {
                                    fabricObj = new fabric.Image(imgElement, baseProps);
                                    resolve(fabricObj);
                                };
                                imgElement.onerror = () => {
                                    console.error('이미지 로드 실패');
                                    resolve()
                                };
                            };
                            reader.onerror = function () {
                                console.error('파일 읽기 실패');
                                resolve();
                            };
                            reader.readAsDataURL(foundImg);
                            return;
                        case "polygon":
                            switch (opt.shapeType) {
                                case "rhombus":
                                    fabricObj = new fabric.Polygon([
                                        { x: 50, y: 0 },
                                        { x: 100, y: 50 },
                                        { x: 50, y: 100 },
                                        { x: 0, y: 50 }
                                    ], baseProps)
                                    break;
                                case "star":
                                    const points = [];
                                    const centerX = 50;
                                    const centerY = 50;
                                    const outerRadius = 50;
                                    const innerRadius = 25;
                                    for (let i = 0; i < 10; i++) {
                                        const angle = (Math.PI / 5) * i;
                                        const radius = i % 2 === 0 ? outerRadius : innerRadius;
                                        points.push({
                                            x: centerX + radius * Math.cos(angle - Math.PI / 2),
                                            y: centerY + radius * Math.sin(angle - Math.PI / 2),
                                        });
                                    }
                                    fabricObj = new fabric.Polygon(points, baseProps);
                                    break;
                                case "pentagon":
                                    const pentagonSize = 60;
                                    const pentagonCenterX = 150;
                                    const pentagonCenterY = 150;
                                    const pentagonPoints = [];
        
                                    for (let i = 0; i < 5; i++) {
                                        const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                                        pentagonPoints.push({
                                            x: pentagonCenterX + pentagonSize * Math.cos(angle),
                                            y: pentagonCenterY + pentagonSize * Math.sin(angle),
                                        });
                                    }
                                    fabricObj = new fabric.Polygon(pentagonPoints, baseProps);
                                    break;
                                case "trapezoid":
                                    const topLeftX = 70;
                                    const topRightX = 130;
                                    const topY = 20;
                                    const bottomY = 120;
                                    const bottomWidth = 100;
                                    const centerXPos = (topLeftX + topRightX) / 2;
                                    const bottomLeftX = centerXPos - bottomWidth / 2;
                                    const bottomRightX = centerXPos + bottomWidth / 2;
        
                                    fabricObj = new fabric.Polygon([
                                        { x: topLeftX, y: topY },
                                        { x: topRightX, y: topY },
                                        { x: bottomRightX, y: bottomY },
                                        { x: bottomLeftX, y: bottomY },
                                    ], baseProps);
                                    break;
                                default:
                                    console.warn(`${opt.shapeType} 잘못된 도형입니다`);
                            }
                            break;
                        case "path":
                            switch (opt.shapeType) {
                                case "heart":
                                    fabricObj = new fabric.Path(`
                                            M 10,30
                                            A 20,20 0 0,1 50,30
                                            A 20,20 0 0,1 90,30
                                            Q 90,60 50,90
                                            Q 10,60 10,30
                                            Z
                                        `, baseProps
                                    )
                                    break;
                                default:
                                    console.warn(`${opt.shapeType} 잘못된 도형입니다`);
                                    break;
                            }
                            break;
                        default:
                            console.warn(`${opt.type} 잘못된 도형입니다`);
                            break;
                    }
                    
                    if (fabricObj) resolve(fabricObj);
                } catch (err) {
                    console.error('도형 처리 중 오류:', err);
                    resolve();
                }
            })
        });

        await Promise.all(promises).then(fabrics => {
            fabrics.forEach(data => {
                data.selectable = false;
                if (data.gameEvent) {
                    data.on('mouseup', () => {
                        data.gameEvent.forEach((eventData, eventIndex) => {
                            executeGameEvent(eventData);
                        })
                    })
                }
                canvas.add(data);
            })
        })
        canvas.renderAll();
    }

    useEffect(() => {
        if(gameZip) loadGameZip(gameZip, setGame, setImgs, setIsReadyToLoad);
    }, [gameZip])

    useEffect(() => {
        if(isReadyToLoad) loadGamePlay(0,0);
    }, [isReadyToLoad]);

    return (
        <div className='PlayPage_wrap'>
            <div style={{color: "white"}}>게임 불러오기<input type='file' accept='.zip' onChange={(event) => setGameZip(event.target.files[0])}/></div>
            <canvas ref={canvasRef} width={1100} height={650}></canvas>
        </div>
    );
}

export default PlayPage;