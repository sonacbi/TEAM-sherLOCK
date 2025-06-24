import * as fabric from 'fabric';
import JSZip from 'jszip';
import { GamePnC, Room, Fabric } from "./gamePnC";

const handleSide = (canvas) => {
    const updatedFabric = [];

    canvas._objects.forEach((data) => {
        if (data.name == 'SherLockRoomController' || data.name == 'SherLockRoomFrame') return; // 프레임은 저장 안 됨
        updatedFabric.push(
            new Fabric({
                name: data?.name,
                option: {
                    x: Number(data?.left.toFixed(2)),
                    y: Number(data?.top.toFixed(2)),
                    width: Number(data?.width.toFixed(2)),
                    height: Number(data?.height.toFixed(2)),
                    angle: Number(data?.angle.toFixed(2)),
                    scaleX: Number(data?.scaleX.toFixed(2)),
                    scaleY: Number(data?.scaleY.toFixed(2)),
                    originX: data?.originX,
                    originY: data?.originY,
                    radius: data?.radius,
                    fill: data?.fill,
                    fillRule: data?.fillRule,
                    text: data?.text,
                    textAlign: data?.textAlign,
                    textBackgroundColor: data?.textBackgroundColor,
                    textLines: data?.textLines,
                    fontFamily: data?.fontFamily,
                    fontSize: data?.fontSize,
                    fontStyle: data?.fontStyle,
                    fontWeight: data?.fontWeight,
                    underline: data?.underline,
                    linethrough: data?.linethrough,
                    strokeWidth: data?.strokeWidth,
                    stroke: data?.stroke,
                    strokeUniform: data?.strokeUniform,
                    id: data?.id,
                    name: data?.name,
                    imgName: data?.imgName,
                    type: data?.type,
                    shapeType: data?.shapeType,
                    gameEvent: data?.gameEvent,

                    selectable: data?.selectable,
                    evented: data?.evented,
                    opacity: data?.opacity,
                    visible: data?.visible,
                    inputWall: data?.inputWall,
                },
            })
        );
    });

    return updatedFabric;
};

const loadCanvas = async (canvas, imgs, side, controlStyle, addFrame, currentRoomRef, currentSideRef, perspectiveRef) => {
    await canvas.clear();

    if (side.frame) {
        const { x, y, width, height, edge } = side.frame;
        addFrame(x, y, width, height, edge, currentRoomRef, currentSideRef, perspectiveRef);
    }

    const promises = side.fabric.map((fabricData) => {
        return new Promise((resolve) => {
            const opt = fabricData.option;
            let shape;
            const baseProps = {
                ...controlStyle,
                ...opt,
                left: opt.x,
                top: opt.y,
            };

            try {
                switch (opt.type) {
                    case "textbox":
                        shape = new fabric.Textbox(opt.text, {
                            ...controlStyle,
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
                            underline: opt.underline,
                            linethrough: opt.linethrough,
                            strokeWidth: opt.strokeWidth,
                            stroke: opt.stroke,
                            strokeUniform: opt.strokeUniform,
                            id: opt.id,
                            name: opt.name,
                            shapeType: opt.shapeType,
                            gameEvent: opt.gameEvent,
                            perPixelTargetFind: false,

                            selectable: opt?.selectable,
                            evented: opt?.evented,
                            opacity: opt?.opacity,
                            visible: opt?.visible,
                        });
                        break;

                    case "line":
                        shape = new fabric.Line(baseProps);
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
                            console.warn('이미지 소스를 찾을 수 없습니다.', opt.imgName);
                            return resolve(); // 계속 진행
                        }

                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const imgElement = new Image();
                            imgElement.src = e.target.result;
                            imgElement.onload = () => {
                                shape = new fabric.Image(imgElement, baseProps);
                                resolve(shape);
                            };
                            imgElement.onerror = () => {
                                console.error('이미지 로드 실패');
                                resolve();
                            };
                        };
                        reader.onerror = () => {
                            console.error('파일 읽기 실패');
                            resolve();
                        };
                        reader.readAsDataURL(foundImg);
                        return; // 조기 리턴 (reader.onload 기다림)
                    }

                    case "polygon": {
                        const { shapeType } = opt;
                        switch (shapeType) {
                            case "rhombus":
                                shape = new fabric.Polygon([
                                    { x: 50, y: 0 },
                                    { x: 100, y: 50 },
                                    { x: 50, y: 100 },
                                    { x: 0, y: 50 }
                                ], baseProps);
                                break;
                            case "star": {
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
                                shape = new fabric.Polygon(points, baseProps);
                                break;
                            }
                            case "pentagon": {
                                const size = 60;
                                const cx = 150;
                                const cy = 150;
                                const points = [];
                                for (let i = 0; i < 5; i++) {
                                    const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                                    points.push({
                                        x: cx + size * Math.cos(angle),
                                        y: cy + size * Math.sin(angle),
                                    });
                                }
                                shape = new fabric.Polygon(points, baseProps);
                                break;
                            }
                            case "trapezoid": {
                                const topLeftX = 70;
                                const topRightX = 130;
                                const topY = 20;
                                const bottomY = 120;
                                const bottomWidth = 100;
                                const centerXPos = (topLeftX + topRightX) / 2;
                                const bottomLeftX = centerXPos - bottomWidth / 2;
                                const bottomRightX = centerXPos + bottomWidth / 2;

                                shape = new fabric.Polygon([
                                    { x: topLeftX, y: topY },
                                    { x: topRightX, y: topY },
                                    { x: bottomRightX, y: bottomY },
                                    { x: bottomLeftX, y: bottomY },
                                ], baseProps);
                                break;
                            }
                            default:
                                console.warn(`${shapeType} 잘못된 도형입니다`);
                        }
                        break;
                    }

                    case "path":
                        if (opt.shapeType === "heart") {
                            shape = new fabric.Path(`
                                M 10,30
                                A 20,20 0 0,1 50,30
                                A 20,20 0 0,1 90,30
                                Q 90,60 50,90
                                Q 10,60 10,30
                                Z
                            `, baseProps);
                        } else {
                            console.warn(`${opt.shapeType} 잘못된 도형입니다`);
                        }
                        break;

                    default:
                        console.error(`${opt.type} 잘못된 도형입니다`);
                        break;
                }

                if (shape) resolve(shape);
            } catch (err) {
                console.error('도형 처리 중 오류:', err);
                resolve(); // 오류 발생해도 resolve는 호출
            }
        });
    });

    await Promise.all(promises).then(fabrics => {
        fabrics.forEach(data => {
            canvas.add(data)
        })
    });
    canvas.discardActiveObject();
    canvas.renderAll();
};

const loadGame = async (game, setCurrentRoom, handleCurrentSide, setSideImgSrcs) => {
    // game.room.forEach((roomData, roomIndex) => {
    //     setCurrentRoom(roomIndex);
    //     roomIndex > 0 && setSideImgSrcs(prev => [...prev, ['']]);
    //     roomData.side.forEach((sideData, sideIndex) => {
    //         handleCurrentSide(sideIndex, sideData)
    //     })
    // })
    // setCurrentRoom(0);
    // handleCurrentSide(0, game.room[0].side[0]);

    // let roomIndex = 0;
    // setInterval(() => {
    //     setCurrentRoom(roomIndex);
    //     roomIndex > 0 && setSideImgSrcs(prev => [...prev, ['']]);
    //     game.room[roomIndex].side.forEach((sideData, sideIndex) => {
    //         handleCurrentSide(sideIndex, sideData);
    //     })
    //     if (roomIndex < game.room.length) roomIndex++;
    //     else return;
    // }, 1000)
    console.log('loadGame 공사 중...🛠️')
}

const loadGameZip = async (file, setGame, setImgs, setIsReadyToLoad) => {
    if (file && file.name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file);
        let gameData;
        const imgFiles = [];
        const tasks = [];
    
        zip.forEach((relativePath, zipEntry) => {
            if (zipEntry.name.endsWith('.json')) {
                tasks.push(
                    zipEntry.async('string').then((content) => {
                        gameData = new GamePnC(JSON.parse(content));
                    })
                );
            } else if (zipEntry.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                tasks.push(
                    zipEntry.async('blob').then((blob) => {
                        imgFiles.push(new File([blob], zipEntry.name));
                    })
                );
            }
        });
    
        await Promise.all(tasks);
    
        setGame(gameData);
        setImgs(imgFiles);
        setIsReadyToLoad(true);
    } else {
        console.warn(`${file.name} 이 파일은 존재하지 않거나 zip 파일이 아닙니다`);
    }
};

export { handleSide, loadCanvas, loadGame, loadGameZip };