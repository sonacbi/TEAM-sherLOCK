import React, { useEffect, useState } from "react";
import * as fabric from 'fabric';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';
import { customAlphabet } from "nanoid";

import EditEventItem from "./EditEventItem";
import { GameEventType, namedFabric } from "../../../modules/editor/gamePnC";
import "./EditObjOptions.css"

import trash from '../../assets/images/EditorPage_img/trash.png';
import frontEnd from '../../assets/images/EditorPage_img/frontEnd.png';
import backEnd from '../../assets/images/EditorPage_img/backEnd.png';
import back from '../../assets/images/EditorPage_img/back.png';
import front from '../../assets/images/EditorPage_img/front.png';
import leftsort from '../../assets/images/EditorPage_img/leftsort.png';
import centersort from '../../assets/images/EditorPage_img/centersort.png';
import rightsort from '../../assets/images/EditorPage_img/rightsort.png';
import underline from '../../assets/images/EditorPage_img/underline.png';
import strikethrough from '../../assets/images/EditorPage_img/strikethrough.png';
import italic from '../../assets/images/EditorPage_img/italic.png';
import bold from '../../assets/images/EditorPage_img/bold.png';


export default function EditObjOptions({canvasInstance, selectedObject, selectedTool, setImgs, namedFabrics, setNamedFabrics, currentRoom, currentSide}) {
    const foundFabric = canvasInstance.current.getObjects().find(obj => obj === selectedObject);
    const [optionStyle, setOptionStyle] = useState(foundFabric);
    const [activeTab, setActiveTab] = useState("attribute"); // "attribute" 또는 "event"
    const activeObject = canvasInstance.current?.getActiveObject();
    const [showOptions, setShowOptions] = useState(false);

    const [eventList, setEventList] = React.useState(optionStyle.gameEvent || []);

    React.useEffect(() => {
        setEventList(optionStyle.gameEvent || []);
    }, [optionStyle.gameEvent]);

    const onDragEnd = (result) => {
        console.log("드래그 이벤트 발생");
        if (!result.destination) return;

        const items = Array.from(eventList);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setEventList(items);
        setOptionStyle(prev => ({
            ...prev,
            gameEvent: items,
        }));

        if (selectedObject) {
            selectedObject.gameEvent = items;
            canvasInstance.current.requestRenderAll();
        }
    };

    const eventValues = {
        move: {
            name: "이동", color: "#89b9e7",
            explain: "방, 스테이지 이동 이벤트"
        },
        appearObj: {
            name: "객체 출현", color: "#c695ff",
            explain: "숨김 → 출현 이벤트"
        },
        hideObj: {
            name: "객체 숨김", color: "#c695ff",
            explain: "출현 → 숨김 이벤트"
        },
        removeObj: {
            name: "객체 제거", color: "#f57070",
            explain: "객체 삭제 이벤트"
        },
        changeObj: {
            name: "객체 변경", color: "#f57070",
            explain: "객체 변경 이벤트"
        },
        getItem: {
            name: "아이템 얻기", color: "#d0bc5a",
            explain: "인벤토리 저장 이벤트"
        },
        dropItem: {
            name: "아이템 제거", color: "#d0bc5a",
            explain: "인벤토리 제거 이벤트"
        },
        startTime: {
            name: "타이머 시작", color: "#8db4c1",
            explain: "타이머 시작 이벤트"
        },
        endTime: {
            name: "타이머 종료", color: "#8db4c1",
            explain: "타이머 종료 이벤트"
        },
        save: {
            name: "저장", color: "#71c39a",
            explain: "세이브포인트 이벤트"
        },
        delay: {
            name: "딜레이", color: "#ffba65",
            explain: "딜레이 후 행동 이벤트"
        },
    };
    const editOption = (event, option) => {
        const foundFabric = canvasInstance.current.getObjects().find(obj => obj === selectedObject);
        if(!foundFabric) return;
        setOptionStyle(foundFabric);
        
        let value = event.target.value;
        const numberOptions = ['scaleX', 'scaleY', 'left', 'top', 'strokeWidth', 'fontSize'];
        if(numberOptions.includes(option)) value = Number(value);

        switch (option) {
            case 'name':
                // 이름이 비어 있거나 지웠다면, id도 없앰
                if (!value && value.length <= 0) {
                    const filtered = namedFabrics.filter(item => item.id !== foundFabric.id);
                    setNamedFabrics(filtered);
                    setOptionStyle(prev => ({...prev, id: undefined}));
                    foundFabric.id = undefined;
                }
                // 이름이 있지만 id가 없다면, 숫자+문자+8자로 이루어진 id 부여
                else if (!foundFabric.id) {
                    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                    const nanoid = customAlphabet(alphabet, 6);
                    const id = nanoid();
                    setNamedFabrics(prev => [...prev, new namedFabric({id, name: value, room: currentRoom, side: currentSide})]);
                    setOptionStyle(prev => ({...prev, id: id}));
                    foundFabric.id = id;
                }
                // 이름이 비어 있든, 존재하든 그대로 값 전달
                setNamedFabrics(prev => {
                    const index = prev.findIndex(item => item.id === foundFabric.id);
                    if (!prev[index]) return prev;
                    prev[index].name = value;
                    return [...prev];
                })
                setOptionStyle(prev => ({...prev, name: value}));
                foundFabric.name = value;
                break;
            case 'scaleX':
                foundFabric.scaleX = value;
                setOptionStyle(prev => ({...prev, scaleX: value}));
                break;
            case 'scaleY':
                foundFabric.scaleY = value;
                setOptionStyle(prev => ({...prev, scaleY: value}));
                break;
            case 'left':
                foundFabric.left = value;
                setOptionStyle(prev => ({...prev, left: value}));
                break;
            case 'top':
                foundFabric.top = value;
                setOptionStyle(prev => ({...prev, top: value}));
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
            case 'underline':
                value = event.target.checked ? true : false;
                foundFabric.underline = value;
                setOptionStyle(prev => ({...prev, underline: value}));
                break;
            case 'linethrough':
                value = event.target.checked ? true : false;
                foundFabric.linethrough = value;
                setOptionStyle(prev => ({...prev, linethrough: value}));
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
            foundFabric.dirty = true; // 랜더링용
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

    const addEvent = (eventType) => {
        const event = { [eventType]: GameEventType[eventType], _uuid: uuidv4() };
        if (!selectedObject) return;

        if (!Array.isArray(selectedObject.gameEvent)) {
            selectedObject.gameEvent = [];
        }

        selectedObject.gameEvent = [...selectedObject.gameEvent, event];

        setOptionStyle(prev => ({
            ...prev,
            gameEvent: [...(prev.gameEvent || []), event]
        }));

        canvasInstance.current.requestRenderAll();
        setShowOptions(false);
    };

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

        const tryRemoveImage = (obj) => {
            if (obj.type === 'image' && obj.imgName) {
                const allObjects = canvas.getObjects();
                const sameNameImages = allObjects.filter(o => o.type === 'image' && o.imgName === obj.imgName);
                // 같은 이름을 가진 이미지가 하나뿐일 때만 이미지 목록에서도 삭제
                if (sameNameImages.length === 1) setImgs(prevImgs => prevImgs.filter(img => img.name !== obj.imgName));
            }
        };
        const tryRemoveNamedFabric = (obj) => {
            if (obj.id && obj.name) {
                setNamedFabrics(prev => prev.filter(named => named.id !== obj.id && named.name !== obj.name));
            }
        }

        if (!activeObjects || activeObjects.length === 0) return;

        activeObjects.forEach(obj => {
            if (activeObject instanceof fabric.ActiveSelection) {
                activeObject.forEachObject(obj => {
                    tryRemoveImage(obj);
                    canvas.remove(obj)
                    tryRemoveNamedFabric(obj);
                });
            } else {
                tryRemoveImage(activeObject);
                canvas.remove(activeObject);
                tryRemoveNamedFabric(activeObject);
            }
        });

        canvas.discardActiveObject();
        canvas.requestRenderAll();
    };

    const toggleEventOption = () => {
        setShowOptions(prev => !prev); // 단순히 보이기만 토글
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
                    {activeObject?.type !== "activeselection" && (
                        <div className="default_attribute">
                            {optionStyle?.id && (
                                <p className="object_id">ID - #{optionStyle.id}</p>
                            )}
                            <div className="object_name">
                                <h4>이름 : </h4>
                                <input type="text" value={optionStyle.name || ''} onChange={e => editOption(e, "name")}/>
                            </div>

                            <div>
                                <div><input type="number" step={0.001} value={Number(optionStyle.scaleX)} onChange={e => editOption(e, "scaleX")}/></div>
                                <div><input type="number" step={0.001} value={Number(optionStyle.scaleY)} onChange={e => editOption(e, "scaleY")}/></div>
                                <div><input type="number" value={Number(optionStyle.left)} onChange={e => editOption(e, "left")}/></div>
                                <div><input type="number" value={Number(optionStyle.top)} onChange={e => editOption(e, "top")}/></div>
                            </div>

                            <div className="object_color_line">
                                {activeObject?.type !== "image" && (
                                <div className="color">
                                    <h4>색</h4>
                                    <input type="color" value={optionStyle.fill} onChange={e => editOption(e, "fill")}/>
                                </div>
                                )}

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
                    )}
                    
                    <div className="object_sort">
                        <div className="frontEnd_wrap" onClick={handleUpEnd}>
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
                                        <input type="color" value={optionStyle.textBackgroundColor ?? "#000000"} onChange={e => editOption(e, "textBackgroundColor")}/>
                                    </div>

                                    <div className="textbox_size">
                                        <h4>글꼴 크기</h4>
                                        <input type="number" value={Number(optionStyle.fontSize)} onChange={e => editOption(e, "fontSize")}/>
                                    </div>
                                </div>

                                <div className="textbox_fontType">
                                    <h4>글꼴 유형</h4>

                                    <div className="fontType_wrap">
                                        <label className={`fontFamily ${optionStyle.fontStyle == "italic" && "selected"}`}>
                                            <img id="italic" src={italic} alt="italic" />
                                            <input type="checkbox" checked={optionStyle.fontStyle == "italic"} onChange={e => editOption(e, "fontStyle")}/>
                                        </label>

                                        <label className={`fontFamily ${optionStyle.fontWeight == "bold" && "selected"}`}>
                                            <img id="bold" src={bold} alt="bold" />
                                            <input type="checkbox" checked={optionStyle.fontWeight == "bold"} onChange={e => editOption(e, "fontWeight")}/>
                                        </label>

                                        <label className={`fontFamily ${optionStyle.underline && "selected"}`}>
                                            <img id="underline" src={underline} alt="underline" />
                                            <input type="checkbox" checked={optionStyle.underline} onChange={e => editOption(e, "underline")}/>
                                        </label>

                                        <label className={`fontFamily ${optionStyle.linethrough && "selected"}`}>
                                            <img id="strikethrough" src={strikethrough} alt="strikethrough" />
                                            <input type="checkbox" checked={optionStyle.linethrough} onChange={e => editOption(e, "linethrough")}/>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </>
                    )}
                </>
            )}

            {activeTab === "event" && (
                <div className="event_wrap">
                    {/* 이벤트 추가 버튼: 항상 표시 */}
                    <button className='add_event' onClick={toggleEventOption}>
                        이벤트 추가하기
                    </button>

                    {showOptions && (
                        <div className="event_option">
                            {Object.keys(GameEventType).map(key => (
                                <p
                                    key={key}
                                    onClick={() => addEvent(key)}
                                    style={{ cursor: "pointer", '--hover-event': eventValues[key].color }}
                                >
                                    {/* 예를 들어 "move" => "이동 - 방, 컷 이동 이벤트" 등 텍스트 직접 작성 필요 */}
                                    {`${eventValues[key].name} - ${eventValues[key].explain}`}
                                </p>
                            ))}
                        </div>
                    )}

                    <div className="event_list" style={{ marginTop: eventList.length > 0 ? "10px" : "0px" }}>
                        {eventList.length > 0 && (
                            <DragDropContext onDragEnd={onDragEnd}>
                                <Droppable droppableId="droppable-event-list" style={{  }}>
                                    {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} style={{ listStyle: "none", padding: 0, display : 'flex', flexDirection : 'column' }}>
                                        {eventList.map((event, index) => {
                                        const uniqueId = String(event._uuid);
                                        const eventKey = Object.keys(event).find(k => k !== "_uuid");
                                        return (
                                            <Draggable key={uniqueId} draggableId={`event-${uniqueId}`} index={index}>
                                                {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}             
                                                            {...provided.draggableProps}        
                                                            {...provided.dragHandleProps}       
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                marginTop: "15px",
                                                                cursor: snapshot.isDragging ? "grabbing" : "grab",
                                                            }}
                                                        >
                                                    <EditEventItem
                                                        event={event}
                                                        index={index}
                                                        eventValues={eventValues}
                                                        namedFabrics={namedFabrics}
                                                        onChange={(updatedEvent) => {
                                                        const newEvents = [...eventList];
                                                        newEvents[index] = {
                                                            ...updatedEvent,
                                                            _uuid: newEvents[index]._uuid  // 기존 uuid 유지
                                                        };
                                                        setEventList(newEvents);
                                                        if (selectedObject) {
                                                            selectedObject.gameEvent = newEvents;
                                                            setOptionStyle(prev => ({ ...prev, gameEvent: newEvents }));
                                                            canvasInstance.current.requestRenderAll();
                                                        }
                                                        }}
                                                        onRemove={() => {
                                                        const newEvents = eventList.filter((_, i) => i !== index);
                                                        setEventList(newEvents);
                                                        if (selectedObject) {
                                                            selectedObject.gameEvent = newEvents;
                                                            setOptionStyle(prev => ({ ...prev, gameEvent: newEvents }));
                                                            canvasInstance.current.requestRenderAll();
                                                        }
                                                        }}
                                                    />
                                                    </div>
                                                )}
                                            </Draggable>
                                        );
                                        })}
                                        {provided.placeholder}
                                    </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

