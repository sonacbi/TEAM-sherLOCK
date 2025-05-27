import * as fabric from 'fabric';
import JSZip from 'jszip';
import { GamePnC, Room, Side, Fabric } from "./gamePnC";

const handleSide = (canvas, setSide, setRoom) => {
    const updatedFabric = [];

    canvas._objects.forEach((data) => {
        if (data.name == 'SherLockRoomController' || data.name == 'SherLockRoomFrame') return; // 프레임은 저장 안 됨
console.log('data',data)
        updatedFabric.push(
            new Fabric({
                name: data?.name,
                option: {
                    x: Number(data?.left.toFixed(2)),
                    y: Number(data?.top.toFixed(2)),
                    width: Number(data?.width.toFixed(2)),
                    height: Number(data?.height.toFixed(2)),
                    angle: Number(data?.angle.toFixed(2)),
                    scaleX: data?.scaleX,
                    scaleY: data?.scaleY,
                    fill: data?.fill,
                    fillRule: data?.fillRule,
                    backgroundColor: data?.backgroundColor,
                    borderColor: data?.borderColor,
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
                    shapeType: data?.shapeType
                },
                event: data?.event
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
    console.log('loadGame - canvas', canvas)
    game.room.forEach((roomData, roomIndex) => {
        roomData.side.forEach((sideData, sideIndex) => {
            canvas.clear();
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
                        shape = new fabric.Line({...controlStyle, ...opt});
                        break;
                    case "rect":
                        shape = new fabric.Rect({...controlStyle, ...opt});
                        break;
                    case "triangle":
                        shape = new fabric.Triangle({...controlStyle, ...opt});
                        break;
                    case "circle":
                        shape = new fabric.Circle({...controlStyle, ...opt});
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
                        shape = new fabric.Polygon({...controlStyle, ...opt});
                        break;
                    case "path":
                        shape = new fabric.Path({...controlStyle, ...opt});
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