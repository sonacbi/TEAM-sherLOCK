import { useEffect, useState } from "react";

import EditEventItem from "./EditEventItem";
import { GameEventType } from "../../../modules/editor/gamePnC";
import "./EditObjOptions.css"

import trash from '../../assets/images/EditorPage_img/trash.png';
import frontEnd from '../../assets/images/EditorPage_img/frontEnd.png';
import backEnd from '../../assets/images/EditorPage_img/backEnd.png';
import back from '../../assets/images/EditorPage_img/back.png';
import front from '../../assets/images/EditorPage_img/front.png';
import leftsort from '../../assets/images/EditorPage_img/leftsort.png';
import centersort from '../../assets/images/EditorPage_img/centersort.png';
import rightsort from '../../assets/images/EditorPage_img/rightsort.png';

export default function EditObjOptions({canvasInstance, selectedObject, selectedTool, setImgs}) {
    const foundFabric = canvasInstance.current.getObjects().find(obj => obj === selectedObject);
    const [optionStyle, setOptionStyle] = useState(foundFabric);
    const [activeTab, setActiveTab] = useState("attribute"); // "attribute" 또는 "event"
    const activeObject = canvasInstance.current?.getActiveObject();

    const editOption = (event, option) => {
        const foundFabric = canvasInstance.current.getObjects().find(obj => obj === selectedObject);
        if(!foundFabric) return;
        setOptionStyle(foundFabric);
        
        let value = event.target.value;
        const numberOptions = ['strokeWidth', 'fontSize'];
        if(numberOptions.includes(option)) value = Number(value);

        switch (option) {
            case 'name':
                foundFabric.name = value;
                setOptionStyle(prev => ({...prev, name: value}));
                break;
            case 'fill':
                foundFabric.fill = value;
                setOptionStyle(prev => ({...prev, fill: value}));
                break;
            case 'stroke':
                foundFabric.stroke = value;
                setOptionStyle(prev => ({...prev, stroke: value}));
                break;
            case 'strokeWidth':
                foundFabric.strokeWidth = value;
                setOptionStyle(prev => ({...prev, strokeWidth: value}))
                break;
            case 'textAlign':
                foundFabric.textAlign = value;
                setOptionStyle(prev => ({...prev, textAlign: value}));
                break;
            case 'textBackgroundColor':
                foundFabric.textBackgroundColor = value;
                setOptionStyle(prev => ({...prev, textBackgroundColor: value}));
                break;
            case 'fontFamily':
                foundFabric.fontFamily = value;
                setOptionStyle(prev => ({...prev, fontFamily: value}));
                break;
            case 'fontSize':
                foundFabric.fontSize = value;
                setOptionStyle(prev => ({...prev, fontSize: value}));
                break;
            case 'fontStyle':
                value = event.target.checked ? "italic" : "normal";
                foundFabric.fontStyle = value;
                setOptionStyle(prev => ({...prev, fontStyle: value}));
                break;
            case 'fontWeight':
                value = event.target.checked ? "bold" : "normal";
                foundFabric.fontWeight = value;
                setOptionStyle(prev => ({...prev, fontWeight: value}));
                break;
            case 'event':
                foundFabric.event = value;
                break;
            default:
                console.warn(`${option} 잘못된 option입니다`)
                break;
        }
        try {
            foundFabric.set(option, value);
            foundFabric.dirty = true;
            canvasInstance.current.requestRenderAll();
        } catch (error) {
            console.error(`속성 '${option}' 설정 중 오류:`, error);
        }
    }
    
    const moveItem = (fromIndex, toIndex) => {
        const array = canvasInstance.current.getObjects()
        const item = array.splice(fromIndex, 1)[0]; // fromIndex 위치에서 요소 제거
        array.splice(toIndex, 0, item);             // toIndex 위치에 삽입
        return array;
    }

    const handleUp = () => {
        const canvas = canvasInstance.current;
        canvas.bringObjectForward(selectedObject);
        canvas.requestRenderAll();
    }
    const handleDown = () => {
        const canvas = canvasInstance.current;
        canvas.sendObjectBackwards(selectedObject);
        canvas.requestRenderAll();
    }
    const handleUpEnd = () => {
        const canvas = canvasInstance.current;
        canvas.bringObjectToFront(selectedObject);
        canvas.requestRenderAll();
    }
    const handleDownEnd = () => {
        const canvas = canvasInstance.current;
        if(canvas.getObjects().find(obj => obj.name === 'SherLockRoomController')) {
            canvas.sendObjectToBack(selectedObject);
            canvas.bringObjectForward(selectedObject);
            canvas.bringObjectForward(selectedObject);
        } else canvas.sendObjectToBack(selectedObject);
        canvas.requestRenderAll();
    }

    const addEvent = () => {
        const event = { move: GameEventType["move"] };
        const canvas = canvasInstance.current;
        const foundFabric = canvas.getObjects().find(obj => obj === selectedObject);
        if (!foundFabric) return;

        // 기존 gameEvent가 없으면 초기화
        if (!Array.isArray(foundFabric.gameEvent)) {
            foundFabric.gameEvent = [];
        }

        // 직접 복사본 생성 후 set
        foundFabric.gameEvent = [...foundFabric.gameEvent, event];

        // 상태도 마찬가지로 불변성 유지
        setOptionStyle(prev => ({
            ...prev,
            gameEvent: [...(prev.gameEvent || []), event]
        }));

        canvas.requestRenderAll();
    }

    useEffect(() => {
        const found = canvasInstance.current?.getObjects().find(obj => obj === selectedObject);
        if (found) {
            if (!found.gameEvent) found.gameEvent = [];
            setOptionStyle({ ...found });
        }
    }, [selectedObject])

    const handleDelete = () => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const activeObjects = canvas.getActiveObjects(); // 항상 배열로 처리

        if (!activeObjects || activeObjects.length === 0) return;

        activeObjects.forEach(obj => {
            if (obj.type === 'image' && obj.name && setImgs) {
                const allObjects = canvas.getObjects();
                const sameNameImages = allObjects.filter(o => o.type === 'image' && o.name === obj.name);
                if (sameNameImages.length === 1) {
                    setImgs(prev => prev.filter(img => img.name !== obj.name));
                }
            }
            canvas.remove(obj);
        });

        canvas.discardActiveObject();
        canvas.requestRenderAll();
    };

    return(
        <div className='object_edit'>
            <div className="object_select_wrap">
                <div className="object_select">
                    <p>선택된 객체 :</p>
                    <p>
                        {activeObject?.type === "activeselection"
                        ? "그룹"
                        : activeObject?.type === "textbox"
                        ? "텍스트"
                        : activeObject?.type === "image"
                        ? "사진"
                        : "도형"}
                    </p>

                    <img id="trash" src={trash} alt="trash" onClick={handleDelete}/>
                </div>

                <div className="attribute_event_menu">
                    <div
                        className={`attribute_menu ${activeTab === "attribute" ? "selected" : ""}`}
                        onClick={() => setActiveTab("attribute")}
                    >
                        <p>속성</p>
                    </div>

                    <div
                        className={`event_menu ${activeTab === "event" ? "selected" : ""} ${activeObject?.type === "activeselection" ? "disabled" : ""}`}
                        onClick={() => {
                            if (activeObject?.type !== "activeSelection") {
                            setActiveTab("event");
                            }
                        }}
                    >
                        <p>이벤트</p>
                    </div>
                </div>
            </div>

            {activeTab === "attribute" && (
                <>
                    {activeObject?.type !== "image" && activeObject?.type !== "activeselection" && (
                        <>
                        <div className="default_attribute">
                            <div className="object_name">
                                <h4>이름 : </h4>
                                <input type="text" value={optionStyle.name || ''} onChange={e => editOption(e, "name")}/>
                            </div>

                            <div className="object_color_line">
                                <div className="color">
                                    <h4>색</h4>
                                    <input type="color" value={optionStyle.fill} onChange={e => editOption(e, "fill")}/>
                                </div>

                                <div className="line_color">
                                    <h4>윤곽선</h4>
                                    <input type="color" value={optionStyle.stroke ?? "#333333"} onChange={e => editOption(e, "stroke")}/>
                                </div>

                                <div className="line_width">
                                    <h4>윤곽선 두께</h4>
                                    <input type="number" min={0} value={Number(optionStyle.strokeWidth)} onChange={e => editOption(e, "strokeWidth")}/>
                                </div>
                            </div>
                        </div>
                        </>
                    )}
                    
                    <div className="object_sort" onClick={handleUpEnd}>
                        <div className="frontEnd_wrap">
                            <img id="frontEnd" src={frontEnd} alt="frontEnd" />
                            <button>맨 앞으로</button>
                        </div>

                        <div className="front_wrap" onClick={handleUp}>
                            <img id="front" src={front} alt="front" />
                            <button>앞으로</button>
                        </div>

                        <div className="backEnd_wrap" onClick={handleDownEnd}>
                            <img id="backEnd" src={backEnd} alt="backEnd" />
                            <button>맨 뒤로</button>
                        </div>

                        <div className="back_wrap" onClick={handleDown}>
                            <img id="back" src={back} alt="back" />
                            <button>뒤로</button>
                        </div>
                    </div>

                    {activeObject?.type === "textbox" && (
                        <>
                        <div className="object_textbox_attribute">
                            <div className="textbox_sort">
                                <h4>글 정렬</h4>

                                <div className="textbox_sort_type">
                                    <label className={`editOpt_textAlign ${optionStyle.textAlign == "left" ? "selected" : ""}`}>
                                        <img id="leftsort" src={leftsort} alt="leftsort" />
                                        <input type="radio" name="textAlign" value="left" checked={selectedObject.textAlign == "left"} onChange={e => editOption(e, "textAlign")}/>
                                    </label>

                                    <label className={`editOpt_textAlign ${optionStyle.textAlign == "center" ? "selected" : ""}`}>
                                        <img id="centersort" src={centersort} alt="centersort" />
                                        <input type="radio" name="textAlign" value="center" checked={selectedObject.textAlign == "center"} onChange={e => editOption(e, "textAlign")}/>
                                    </label>

                                    <label className={`editOpt_textAlign ${optionStyle.textAlign == "right" ? "selected" : ""}`}>
                                        <img id="rightsort" src={rightsort} alt="rightsort" />
                                        <input type="radio" name="textAlign" value="right" checked={selectedObject.textAlign == "right"} onChange={e => editOption(e, "textAlign")}/>
                                    </label>

                                    {/* <label className={`editOpt_textAlign ${optionStyle.textAlign == "justify" ? "selected" : ""}`}>
                                        <img id="rightsort" src={rightsort} alt="rightsort" />
                                        <input type="radio" name="textAlign" value="justify" checked={selectedObject.textAlign == "justify"} onChange={e => editOption(e, "textAlign")}/>
                                    </label> */}
                                </div>
                            </div>

                            <div className="textbox_fontstyle">  
                                <select style={{fontFamily: `${optionStyle.fontFamily}`}} value={optionStyle.fontFamily} onChange={e => editOption(e, "fontFamily")}>
                                    <option style={{fontFamily: "맑은 고딕"}} value="맑은 고딕">맑은 고딕</option>
                                    <option style={{fontFamily: "굴림"}} value="굴림">굴림</option>
                                    <option style={{fontFamily: "바탕"}} value="바탕">바탕</option>
                                    <option style={{fontFamily: "궁서"}} value="궁서">궁서</option>
                                    <option style={{fontFamily: "Arial"}} value="Arial">Arial</option>
                                    <option style={{fontFamily: "Arial Black"}} value="Arial Black">Airal Black</option>
                                    <option style={{fontFamily: "Comic Sans MS"}} value="Comic Sans MS">Comic Sans MS</option>
                                    <option style={{fontFamily: "Courier New"}} value="Courier New">Courier New</option>
                                    <option style={{fontFamily: "Impact"}} value="Impact">Impact</option>
                                    <option style={{fontFamily: "Tahoma"}} value="Tahoma">Tahoma</option>
                                    <option style={{fontFamily: "Times New Roman"}} value="Times New Roman">Times New Roman</option>
                                </select>
                            </div>

                            <div className="textbox_category_wrap">
                                <div className="background_size_wrap">
                                    <div className="textbox_background">
                                        <h4>글 배경</h4>
                                        <input type="color" value={optionStyle.textBackgroundColor ? optionStyle.textBackgroundColor : "#000000"} onChange={e => editOption(e, "textBackgroundColor")}/>
                                    </div>

                                    <div className="textbox_size">
                                        <h4>글꼴 크기</h4>
                                        <input type="number" value={Number(optionStyle.fontSize)} onChange={e => editOption(e, "fontSize")}/>
                                    </div>
                                </div>

                                <h4>글꼴 유형</h4>
                                <label className={`fontFamily ${optionStyle.fontStyle == "italic" && "selected"}`}><i>I</i><input type="checkbox" checked={optionStyle.fontStyle == "italic"} onChange={e => editOption(e, "fontStyle")}/></label>
                                <label className={`fontFamily ${optionStyle.fontWeight == "bold" && "selected"}`}><b>B</b><input type="checkbox" checked={optionStyle.fontWeight == "bold"} onChange={e => editOption(e, "fontWeight")}/></label>
                            </div>
                        </div>
                        </>
                    )}
                </>
            )}

            {activeTab === "event" && (
                <div className="event_wrap">
                    {Array.isArray(optionStyle.gameEvent) && optionStyle.gameEvent.length > 0 && (
                        <>
                            {optionStyle.gameEvent.map((data, index) => {
                                const obj = canvasInstance.current.getObjects().find(obj => obj === selectedObject);
                                return (
                                    <div key={`event-${index}`}>
                                        <EditEventItem
                                            event={data}
                                            index={index}
                                            onChange={(updatedEvent) => {
                                                const newGameEvents = [...optionStyle.gameEvent];
                                                newGameEvents[index] = updatedEvent;
                                                if (obj) {
                                                    obj.gameEvent = newGameEvents;
                                                    setOptionStyle(prev => ({ ...prev, gameEvent: newGameEvents }));
                                                    canvasInstance.current.requestRenderAll();
                                                }
                                            }}
                                            onRemove={() => {
                                                const newGameEvents = optionStyle.gameEvent.filter((_, i) => i !== index);
                                                if (obj) {
                                                    obj.gameEvent = newGameEvents;
                                                    setOptionStyle(prev => ({ ...prev, gameEvent: newGameEvents }));
                                                    canvasInstance.current.requestRenderAll();
                                                }
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </>
                    )}
                    


                    {/* 이벤트 추가 버튼: 항상 표시 */}
                    <button className='add_event' onClick={addEvent}>
                        이벤트 추가하기
                    </button>
                </div>
            )}
        </div>
    )
}

