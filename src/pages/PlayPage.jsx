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
                        backgroundColor: opt.backgroundColor,
                        borderColor: opt.borderColor,
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
                        editable: opt.editable,
                        name: opt.name,
                        shapeType: opt.shapeType,
                    });
                    break;
                case "line":
                    fabricObj = new fabric.Line({...opt});
                    break;
                case "rect":
                    fabricObj = new fabric.Rect({...opt});
                    break;
                case "triangle":
                    fabricObj = new fabric.Triangle({...opt});
                    break;
                case "circle":
                    fabricObj = new fabric.Circle({...opt});
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
                            break;
                        case "star":
                            break;
                        case "pentagon":
                            break;
                        case "trapezoid":
                            break;
                        default:
                            console.warn(`${opt.shapeType} 잘못된 도형입니다`);
                    }
                    break;
                case "path":
                    switch (opt.shapeType) {
                        case "heart":
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