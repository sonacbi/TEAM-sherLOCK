import React, { useEffect, useRef, useState } from 'react';
import JSZip from 'jszip';
import * as fabric from 'fabric';
import fs from 'fs'

import { GamePnC } from '../../modules/editor/gamePnC';
import { loadGameZip } from '../../modules/editor/handleGame';
import '../styles/PlayPage.css';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import playgame_hint_icon from '../assets/images/EditorPage_img/hint_icon.png';
import inventory_icon from '../assets/images/PlayPage_img/inventory_icon.png';

function PlayPage() {
    const canvasRef = useRef(null);
    const canvasInstance = useRef(null);
    const [game, setGame] = useState(new GamePnC({}));
    const [imgs, setImgs] = useState([]);
    const [isReadyToLoad, setIsReadyToLoad] = useState(false);
    const [gameZip, setGameZip] = useState(null);
    const [currentRoom, setCurrentRoom] = useState(0);
    const [currentSide, setCurrentSide] = useState(0);
    const { id } = useParams();
    const navigate = useNavigate();

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
        const canvas = canvasInstance.current;
        const namedFabric = game.namedFabrics.find(item => item.id == event[eventType].id);
        const foundObj = canvas.getObjects().find(item => item.id == event[eventType].id);
        switch (eventType) {
            case "move":
                loadGamePlay(event.move.room, event.move.side)
                break;
            case "appearObj":
                setGame(prev => {
                    const newData = prev;
                    const foundGameFabric = newData.room[namedFabric.room].side[namedFabric.side].fabric.find(item => item.option.id == namedFabric.id);
                    if (foundGameFabric) {
                        newData.room[namedFabric.room].side[namedFabric.side].fabric.find(item => item.option.id == namedFabric.id).option.opacity = 1;
                        newData.room[namedFabric.room].side[namedFabric.side].fabric.find(item => item.option.id == namedFabric.id).option.visible = true;
                        return newData;
                    }
                    return newData;
                });
                if (foundObj) {
                    foundObj.set({
                        opacity: 1, visible: true,
                    });
                    canvas.renderAll();
                }
                break;
            case "hideObj":
                setGame(prev => {
                    const newData = prev;
                    const foundGameFabric = newData.room[namedFabric.room].side[namedFabric.side].fabric.find(item => item.option.id == namedFabric.id);
                    if (foundGameFabric) {
                        newData.room[namedFabric.room].side[namedFabric.side].fabric.find(item => item.option.id == namedFabric.id).option.opacity = 0;
                        newData.room[namedFabric.room].side[namedFabric.side].fabric.find(item => item.option.id == namedFabric.id).option.visible = false;
                        return newData;
                    }
                    return newData;
                });
                if (foundObj) {
                    foundObj.set({
                        opacity: 0, visible: false,
                    });
                    canvas.renderAll();
                }
                break;
            case "removeObj":
                setGame(prev => {
                    const newData = structuredClone(prev);
                    const deleteIndex = newData.room[namedFabric.room].side[namedFabric.side].fabric.findIndex(item => item.option.id == namedFabric.id);
                    newData.room[namedFabric.room].side[namedFabric.side].fabric.splice(deleteIndex, 1);
                    return newData;
                })
                canvas.remove(canvas.getObjects().find(item => item.id == event.removeObj.id));
                break;
            case "changeObj":
                const fromId = event.changeObj.from.id;
                const toId = event.changeObj.to.id;

                // 1. 게임 데이터 수정
                setGame(prev => {
                    const newData = structuredClone(prev);

                    const fromNamed = newData.namedFabrics.find(item => item.id === fromId);
                    const toNamed = newData.namedFabrics.find(item => item.id === toId);

                    if (!fromNamed || !toNamed) return newData;

                    const fabricList = newData.room[fromNamed.room].side[fromNamed.side].fabric;

                    const fromIndex = fabricList.findIndex(item => item.option.id === fromId);
                    const toFabricData = newData.room[toNamed.room].side[toNamed.side].fabric.find(item => item.option.id === toId);

                    if (fromIndex !== -1 && toFabricData) {
                        const fromObj = fabricList[fromIndex];
                        const newToObj = structuredClone(toFabricData);

                        // 위치를 from 기준으로
                        newToObj.option.x = fromObj.option.x;
                        newToObj.option.y = fromObj.option.y;

                        fabricList.splice(fromIndex, 1, newToObj); // from → to 교체
                    }

                    return newData;
                });

                // 2. 캔버스에서 from 제거
                const fromCanvasObj = canvas.getObjects().find(obj => obj.id === fromId);
                if (fromCanvasObj) {
                    const { left, top } = fromCanvasObj;
                    canvas.remove(fromCanvasObj);

                    // 3. 캔버스에 to 생성해서 추가
                    const toNamed = game.namedFabrics.find(item => item.id === toId);
                    if (toNamed) {
                        const toFabricData = game.room[toNamed.room].side[toNamed.side].fabric.find(item => item.option.id === toId);
                        if (toFabricData) {
                            const opt = toFabricData.option;
                            const newObj = makeFabric(opt);

                            if (newObj) {
                                newObj.set({left, top})
                                canvas.add(newObj);
                                canvas.renderAll();
                            }
                        }
                    }
                }
                break;
            case "getItem":
                break;
            case "dropItem":
                break;
            case "startTime":
                break;
            case "endTime":
                break;
            // case "startSound":
            //     break;
            // case "endSound":
            //     break;
            case "save":
                break;
            case "delay":
                break;
            default:
                console.warn('잘못된 이벤트입니다', event);
                break;
        }
    }

    const loadGamePlay = async (roomIndex, sideIndex) => {
        if (!game.room?.[roomIndex].side?.[sideIndex]) {
            console.warn('존재하지 않은 게임 위치입니다');
            return;
        }
        const canvas = canvasInstance.current;
        await canvas.clear();
        setCurrentRoom(roomIndex);
        setCurrentSide(sideIndex);

        const promises = game.room[roomIndex].side[sideIndex].fabric.map(async shape => {
            return await makeFabric(shape.option);
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

    const makeFabric = async (opt) => {
        return new Promise((resolve, reject) => {
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
                            id: opt.id,
                            name: opt.name,
                            shapeType: opt.shapeType,
                            gameEvent: opt.gameEvent,
    
                            selectable: opt?.selectable,
                            evented: opt?.evented,
                            opacity: opt?.opacity,
                            visible: opt?.visible,
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
                        const foundImg = imgs.find(img => img.name === opt.imgName);
                        if (!foundImg) {
                            console.warn('이미지 소스를 찾을 수 없습니다.', opt.imgName);
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
                                resolve();
                            };
                        };
                        reader.onerror = function () {
                            console.error('파일 읽기 실패');
                            resolve();
                        };
                        reader.readAsDataURL(foundImg);
                        break;
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
        });
    }

    const TimerComponent = () => {
        const [timeElapsed, setTimeElapsed] = useState(0); // 0초부터 시작

        useEffect(() => {
            const timer = setInterval(() => {
            setTimeElapsed(prev => prev + 1);
            }, 1000);

            return () => clearInterval(timer); // 언마운트 시 정리
        }, []);

        const formatTime = (seconds) => {
            const m = String(Math.floor(seconds / 60)).padStart(2, '0');
            const s = String(seconds % 60).padStart(2, '0');
            return `${m} : ${s}`;
        };

        return (<p>{formatTime(timeElapsed)}</p>);
    };

    useEffect(() => {
        if(id) {
            fetch(`http://localhost:4000/game/${id}/zip`)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "game.zip", { type: "application/zip" });
                setGameZip(file); // loadGameZip에서 처리
                console.log('게임 zip 파일 불러옴');
            })
            .catch(error => {
                console.error('게임 파일 불러오는 중 오류 발생', error);
            });
        }
    }, [id]);

    useEffect(() => {
        loadGamePlay(currentRoom, currentSide);
    }, [game])

    useEffect(() => {
        if(gameZip) loadGameZip(gameZip, setGame, setImgs, setIsReadyToLoad);
    }, [gameZip])

    useEffect(() => {
        if(isReadyToLoad) loadGamePlay(0,0);
    }, [isReadyToLoad]);

    return (
        <div className='PlayPage_wrap'>
            {/* <div style={{color: "white"}}>게임 불러오기<input type='file' accept='.zip' onChange={(event) => setGameZip(event.target.files[0])}/></div> */}

            <div className='playgame_wrap'>
                <div className='playgame_header'>
                    <h3 onClick={() => navigate(-1)}>◀ EXIT</h3>
                </div>

                <div className='top_menu_wrap'>
                    <div className='stage_name'>
                        <h3>스테이지 {currentRoom+1}</h3>

                        {game.room[currentRoom].name.length === 0 || <h3 className='stage_title'>{game.room[currentRoom].name}</h3>}
                    </div>
                    
                    <div className='playgame_timer'>
                        <TimerComponent />
                    </div>
                </div>

                <div className='canvas_wrap'>
                    <canvas ref={canvasRef} width={1100} height={650}></canvas>
                </div>

                <div className='bottom_menu_wrap'>
                    <div className='bottom_menu_button'>
                        <div className='hint_menu_button'>
                            <img id='playgame_hint_icon' src={playgame_hint_icon} alt='playgame_hint_icon' />
                        </div>

                        <div className='inventory_menu_button'>
                            <img id='inventory_icon' src={inventory_icon} alt='inventory_icon' />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PlayPage;