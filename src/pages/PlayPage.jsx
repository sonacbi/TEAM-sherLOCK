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
    const [currentRoom, setCurrentRoom] = useState(0);
    const [currentSide, setCurrentSide] = useState(0);
    const [imgs, setImgs] = useState([]);
    const [isReadyToLoad, setIsReadyToLoad] = useState(false);
    const [gameZip, setGameZip] = useState(null);

    useEffect(() => {
        const canvas = new fabric.Canvas(canvasRef.current, {
            width: 1100,
            height: 650,
            backgroundColor: 'white',
            selection: false,
            hoverCursor: null,
        })
        canvasInstance.current = canvas;

        return () => canvas.dispose();
    }, [])

    const loadGamePlay = () => {
        const canvas = canvasInstance.current;
        console.clear();
        // canvas.clear();
        game.room[currentRoom].side[currentSide].fabric.forEach((shape, index) => {
            const opt = shape.option;
            let fabricObj;
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
                    fabricObj = new fabric.Line({...opt, left: opt.x, top: opt.y});
                    break;
                case "rect":
                    fabricObj = new fabric.Rect({...opt, left: opt.x, top: opt.y});
                    break;
                case "triangle":
                    fabricObj = new fabric.Triangle({...opt, left: opt.x, top: opt.y});
                    break;
                case "circle":
                    fabricObj = new fabric.Circle({...opt, left: opt.x, top: opt.y});
                    break;
                case "image":
                    const foundImg = imgs.find(img => img.name === opt.name);
                    if (foundImg) {
                        const reader = new FileReader();
                        reader.onload = function (e) {
                            if (!canvas) return;
                            const imgElement = new Image();
                            imgElement.src = e.target.result;
                            imgElement.onload = () => {
                                fabricObj = new fabric.Image(imgElement, {...opt, left: opt.x, top: opt.y});
                                fabricObj.selectable = false;
                                canvas.add(fabricObj);
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
                        console.warn('이미지 소스를 찾을 수 없습니다.', opt.name);
                    }
                    return;
                case "polygon":
                    switch (opt.shapeType) {
                        case "rhombus":
                            fabricObj = new fabric.Polygon([
                                { x: 50, y: 0 },
                                { x: 100, y: 50 },
                                { x: 50, y: 100 },
                                { x: 0, y: 50 }
                            ], {...opt, left: opt.x, top: opt.y})
                            break;
                        case "star":
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
                            fabricObj = new fabric.Polygon(points, {...opt, left: opt.x, top: opt.y});
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
                            fabricObj = new fabric.Polygon(pentagonPoints, {...opt, left: opt.x, top: opt.y});
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
                            ], {...opt, left: opt.x, top: opt.y});
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
                                `, {...opt, left: opt.x, top: opt.y}
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
            console.log('fabricObj',fabricObj)
            if (fabricObj) {
                fabricObj.selectable = false;
                canvas.add(fabricObj);
            } else console.warn('!!! fabricObj가 이상함', fabricObj)
        });
        canvas.renderAll();
    }

    useEffect(() => {
        if(gameZip) loadGameZip(gameZip, setGame, setImgs, setIsReadyToLoad);
    }, [gameZip])

    useEffect(() => {
        if(isReadyToLoad) loadGamePlay();
    }, [isReadyToLoad]);

    return (
        <div className='PlayPage_wrap'>
            <div style={{color: "white"}}>게임 불러오기<input type='file' accept='.zip' onChange={(event) => setGameZip(event.target.files[0])}/></div>
            <canvas ref={canvasRef} width={1100} height={650}></canvas>
        </div>
    );
}

export default PlayPage;