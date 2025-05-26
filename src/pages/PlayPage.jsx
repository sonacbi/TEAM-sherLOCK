import React, { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import * as fabric from 'fabric';

import '../styles/PlayPage.css';
import { GamePnC } from '../../modules/editor/gamePnC';

function PlayPage() {
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [game, setGame] = useState(new GamePnC({}));
    const [currentRoom, setCurrentRoom] = useState(0);
    const [currentSide, setCurrentSide] = useState(0);
    const [imgs, setImgs] = useState([new File([], '')]);
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

    const loadGamePlay = () => {
        const canvas = canvasInstance.current;
        // canvas.clear();
        // const ctx = canvas.getContext("2d");
        game.room[currentRoom].side[currentSide].fabric.forEach((shape, index) => {
            const opt = shape.option;
            switch (shape.option.type) {
                case "textbox":
                    // ctx.font = `${opt.fontSize}px ${opt.fontFamily}`;
                    // ctx.fillText(opt.text, opt.x, opt.y);
                    const textbox = new fabric.Textbox(opt.text, {
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
                    textbox.selectable = false;
                    canvas.add(textbox);
                    break;
                case "line":
                    break;
                case "rect":
                    // ctx.fillRect(shape.option.x, shape.option.y, shape.option.width, shape.option.height);
                    // // ctx.lineWidth = 2;
                    // // ctx.strokeRect(shape.option.x, shape.option.y, shape.option.width, shape.option.height);
                    const rect = new fabric.Rect({...opt});
                    rect.selectable = false;
                    canvas.add(rect);
                    break;
                case "triangle":
                    break;
                case "circle":
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
                                // ctx.drawImage(imgElement, opt.x, opt.y);
                                const image = new fabric.Image(imgElement, {left: opt.x, top: opt.y});
                                image.selectable = false;
                                canvas.add(image);
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
                    break;
                case "polygon":
                    break;
                case "path":
                    break;
                default:
                    console.error(`${opt.type} 잘못된 도형입니다`);
                    break;
            }
        });
        canvas.renderAll();
    }

    useEffect(() => {
        if(gameZip) loadGameZip(gameZip);
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