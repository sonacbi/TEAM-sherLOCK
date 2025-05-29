import { useEffect, useState } from "react";
import "./EditObjOptions.css"

export default function EditObjOptions({canvasInstance, selectedObject, handleAddEvent}) {
    const foundFabric = canvasInstance.current.getObjects().find(obj => obj === selectedObject);
    const [optionStyle, setOptionStyle] = useState(foundFabric);

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
                value = event.target.checked ? "italic" : "normal"
                foundFabric.fontStyle = value;
                setOptionStyle(prev => ({...prev, fontStyle: value}));
                break;
            case 'fontWeight':
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
        const obj = canvas.getActiveObject();

        if (canvas && obj) {
            canvas.bringForward(obj);
            canvas.requestRenderAll();
        } else {
            console.warn("선택된 객체가 없거나 canvas가 초기화되지 않았습니다.");
        }
    }
    const handleDown = () => {
        const canvas = canvasInstance.current;
        const obj = canvas.getActiveObject();

        if (canvas && obj) {
            canvas.sendBackwards(obj);
            canvas.requestRenderAll();
        } else {
            console.warn("선택된 객체가 없거나 canvas가 초기화되지 않았습니다.");
        }
    }

    useEffect(() => {
        setOptionStyle(canvasInstance.current.getObjects().find(obj => obj === selectedObject));
    }, [selectedObject])

    return(
        <div className='object_edit'>
            {selectedObject.type !== "image" && (
                <>
                <h3>이름</h3>
                └<input type="text" value={optionStyle.name || ''} onChange={e => editOption(e, "name")}/>
                <br/><br/>
                <h3>색</h3>
                └<input type="color" value={optionStyle.fill} onChange={e => editOption(e, "fill")}/>
                <h3>윤곽선 색</h3>
                └<input type="color" value={optionStyle.stroke ?? "#333333"} onChange={e => editOption(e, "stroke")}/>
                <h3>윤곽선 두께</h3>
                └<input type="number" value={Number(optionStyle.strokeWidth)} onChange={e => editOption(e, "strokeWidth")}/>
                <br/><br/>
                </>
            )}
            {selectedObject.type == "textbox" && (
                <>
                <h3>정렬</h3>
                └<label className={`editOpt_textAlign ${optionStyle.textAlign == "left" ? "selected" : ""}`}>left<input type="radio" name="textAlign" value="left" checked={selectedObject.textAlign == "left"} onChange={e => editOption(e, "textAlign")}/></label>
                <label className={`editOpt_textAlign ${optionStyle.textAlign == "center" ? "selected" : ""}`}>center<input type="radio" name="textAlign" value="center" checked={selectedObject.textAlign == "center"} onChange={e => editOption(e, "textAlign")}/></label>
                <label className={`editOpt_textAlign ${optionStyle.textAlign == "right" ? "selected" : ""}`}>right<input type="radio" name="textAlign" value="right" checked={selectedObject.textAlign == "right"} onChange={e => editOption(e, "textAlign")}/></label>
                <label className={`editOpt_textAlign ${optionStyle.textAlign == "justify" ? "selected" : ""}`}>justify<input type="radio" name="textAlign" value="justify" checked={selectedObject.textAlign == "justify"} onChange={e => editOption(e, "textAlign")}/></label>
                <h3>글 배경</h3>
                └<input type="color" value={optionStyle.textBackgroundColor ? optionStyle.textBackgroundColor : "#000000"} onChange={e => editOption(e, "textBackgroundColor")}/>
                <h3>글꼴</h3>
                └<select style={{fontFamily: `${optionStyle.fontFamily}`}} value={optionStyle.fontFamily} onChange={e => editOption(e, "fontFamily")}>
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
                <h3>글꼴 크기</h3>
                └<input type="number" value={Number(optionStyle.fontSize)} onChange={e => editOption(e, "fontSize")}/>
                <h3>글꼴 유형</h3>
                └<label className={`fontFamily ${optionStyle.fontStyle == "italic" && "selected"}`}><i>I</i><input type="checkbox" checked={optionStyle.fontStyle == "italic"} onChange={e => editOption(e, "fontStyle")}/></label>
                <h3>글꼴 굵기</h3>
                └<select value={optionStyle.fontWeight} onChange={e => editOption(e, "fontWeight")}>
                    <option value="normal">normal</option>
                    <option value="bold">bold</option>
                    <option value="lighter">lighter</option>
                </select><br/><br/>
                </>
            )}
            <button onClick={handleUp}>위로(미구현)</button>
            <button onClick={handleDown}>아래로(미구현)</button>
            <button onClick={handleAddEvent}>event</button>
        </div>
    )
}

