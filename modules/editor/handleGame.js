import * as fabric from 'fabric';
import JSZip from 'jszip';
import { GamePnC, Room, Side, Fabric } from "./gamePnC";

const handleSide = (canvas, setSide, setRoom) => {
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
                    strokeWidth: data?.strokeWidth,
                    stroke: data?.stroke,
                    strokeUniform: data?.strokeUniform,
                    editable: data?.editable,
                    name: data?.name,
                    type: data?.type,
                    shapeType: data?.shapeType,
                    gameEvent: data?.gameEvent
                },
            })
        );
    });

    setSide(prevSide => {
        const updatedSide = new Side({
            name: prevSide.name,
            description: prevSide.description,
            frame: prevSide.frame,
            fabric: [...updatedFabric]
        });

        setRoom(prevRoom => (new Room({
            ...prevRoom,
            side: prevRoom.side.map(s =>
                s.name === updatedSide.name ? updatedSide : s
            )
        })));

        return updatedSide;
    });
};

const loadGame = (game, imgs, canvas, controlStyle, roomController, setPosition, setSize, setAngle, setEdgeFrameState, addFrame) => {
    console.log('loadGame - game', game)
    game.room.forEach((roomData, roomIndex) => {
        roomData.side.forEach((sideData, sideIndex) => {
            canvas.clear();
            if (sideData.frame) {
                new Promise((resolve, reject) => {
                    resolve(sideData);
                })
                .then(data => {
                    roomController.left = data.frame.x;
                    roomController.top = data.frame.y;
                    roomController.width = data.frame.width;
                    roomController.height = data.frame.height;
                    return data;
                })
                .then(data => {
                    setPosition([data.frame.x, data.frame.y]);
                    setSize([data.frame.width, data.frame.height]);
                    setAngle(data.frame.angle);
                    setEdgeFrameState([data.frame.top, data.frame.left, data.frame.right, data.frame.bottom]);
                })
                .finally(addFrame());
            }
            sideData.fabric.forEach((fabricData, fabricIndex) => {
                const opt = fabricData.option;
                let shape;
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
                            strokeWidth: opt.strokeWidth,
                            stroke: opt.stroke,
                            strokeUniform: opt.strokeUniform,
                            editable: opt.editable,
                            name: opt.name,
                            shapeType: opt.shapeType,
                            gameEvent: opt.gameEvent,
                        });
                        break;
                    case "line":
                        shape = new fabric.Line({...controlStyle, ...opt, left: opt.x, top: opt.y});
                        break;
                    case "rect":
                        shape = new fabric.Rect({...controlStyle, ...opt, left: opt.x, top: opt.y});
                        break;
                    case "triangle":
                        shape = new fabric.Triangle({...controlStyle, ...opt, left: opt.x, top: opt.y});
                        break;
                    case "circle":
                        shape = new fabric.Circle({...controlStyle, ...opt, left: opt.x, top: opt.y});
                        break;
                    case "image":
                        const foundImg = imgs.find(img => img.name === opt.name);
                        console.log('foundImg',foundImg)
                        if (foundImg) {
                            const reader = new FileReader();
                            reader.onload = function (e) {
                                if (!canvas) return;
                                const imgElement = new Image();
                                imgElement.src = e.target.result;
                                imgElement.onload = () => {
                                    // const warpedCanvas = warpImageToTrapezoid(imgElement, 40);
                                    // const fabricImage = new fabric.Image(warpedCanvas, {
                                    shape = new fabric.Image(imgElement, {
                                        ...controlStyle, ...opt, left: opt.x, top: opt.y
                                    });
                                    shape.selectable = false;
                                    canvas.add(shape);
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
                                shape = new fabric.Polygon([
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
                                shape = new fabric.Polygon(points, {...opt, left: opt.x, top: opt.y});
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
                                shape = new fabric.Polygon(pentagonPoints, {...opt, left: opt.x, top: opt.y});
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
    
                                shape = new fabric.Polygon([
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
                                shape = new fabric.Path(`
                                        M 10,30
                                        A 20,20 0 0,1 50,30
                                        A 20,20 0 0,1 90,30
                                        Q 90,60 50,90
                                        Q 10,60 10,30
                                        Z
                                    `,{...opt, left: opt.x, top: opt.y}
                                )
                                break;
                            default:
                                console.warn(`${opt.shapeType} 잘못된 도형입니다`);
                                break;
                        }
                        break;
                    default:
                        console.error(`${opt.type} 잘못된 도형입니다`)
                        break;
                }
                if (shape) {
                    canvas.add(shape);
                    canvas.setActiveObject(shape);
                } else console.warn('!!! shape가 이상함', shape)
            })
            canvas.renderAll();
        })
    })
    console.log('loadGame - canvas', canvas);
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

export { handleSide, loadGame, loadGameZip };