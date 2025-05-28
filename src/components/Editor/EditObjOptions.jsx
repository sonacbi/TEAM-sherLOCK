export default function EditObjOptions({canvasInstance, selectedObject, handleAddEvent}) {
    const editOption = (event, option) => {
        const foundFabric = canvasInstance.current.getObjects().find(obj => obj === selectedObject);
        switch (option) {
            case 'name':
                foundFabric.name = event.target.value;
                break;
            case 'fill':
                foundFabric.fill = event.target.value;
                break;
                break;
            case 'stroke':
                foundFabric.stroke = event.target.value;
                break;
            case 'strokeWidth':
                foundFabric.strokeWidth = event.target.value;
            case 'textAlign':
                foundFabric.textAlign = event.target.value;
                break;
            case 'textBackgroundColor':
                foundFabric.textBackgroundColor = event.target.value;
                break;
            case 'fontFamily':
                foundFabric.fontFamily = event.target.value;
                break;
            case 'fontSize':
                foundFabric.fontSize = event.target.value;
                break;
            case 'fontStyle':
                foundFabric.fontStyle = event.target.value;
                break;
            case 'fontWeight':
                foundFabric.fontWeight = event.target.value;
                break;
            case 'event':
                foundFabric.event = event.target.value;
                break;
            default:
                console.warn(`${option} 잘못된 option입니다`)
                break;
        }
        canvasInstance.current.requestRenderAll();
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
        // console.log('!!',canvasInstance.current instanceof fabric.Canvas)
        // canvasInstance.current.bringForward(selectedObject)
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
        // console.log('!!',canvasInstance.current instanceof fabric.Canvas)
        // canvasInstance.current.sendBackwards(selectedObject)
    }

    return(
        <div className='object_edit'>
            <h2>하이</h2>
            {selectedObject.type !== "image" && (
                <>
                이름<br/>
                └<input type="text" value={selectedObject.name} onChange={e => editOption(e, "name")}/> <br/>
                색<br/>
                └<input type="color" value={selectedObject.fill} onChange={e => editOption(e, "fill")}/><br/>
                윤곽선 색<br/>
                └<input type="color" value={selectedObject.stroke ?? "#333333"} onChange={e => editOption(e, "stroke")}/><br/>
                윤곽선 두께<br/>
                └<input type="number" value={Number(selectedObject.strokeWidth)} onChange={e => editOption(e, "strokeWidth")}/><br/>
                </>
            )}
            {selectedObject.type == "textbox" && (
                <>
                textAlign<br/>
                {/* <label>left<input type="radio" name="textAlign" value={selectedObject.textAlign == "left"}/></label>
                <label>center<input type="radio" name="textAlign" value={selectedObject.textAlign == "center"}/></label>
                <label>right<input type="radio" name="textAlign" value={selectedObject.textAlign == "right"}/></label><br/> */}
                └<select value={selectedObject.textAlign} onChange={e => editOption(e, "textAlign")}>
                    <option value="left">left</option>
                    <option value="center">center</option>
                    <option value="right">right</option>
                </select><br/>
                글 배경<br/>
                └<input type="color" value={selectedObject.textBackgroundColor ? selectedObject.textBackgroundColor : "#000000"} onChange={e => editOption(e, "textBackgroundColor")}/><br/>
                글꼴<br/>
                └<select style={{fontFamily: `${selectedObject.fontFamily}`}} value={selectedObject.fontFamily} onChange={e => editOption(e, "fontFamily")}>
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
                </select><br/>
                글꼴 크기<br/>
                └<input type="number" value={Number(selectedObject.fontSize)} onChange={e => editOption(e, "fontSize")}/><br/>
                글꼴 유형<br/>
                └<select value={selectedObject.fontStyle} onChange={e => editOption(e, "fontStyle")}>
                    <option value="normal">normal</option>
                    <option value="italic">italic</option>
                </select><br/>
                글꼴 굵기<br/>
                └<select value={selectedObject.fontWeight} onChange={e => editOption(e, "fontWeight")}>
                    <option value="normal">normal</option>
                    <option value="bold">bold</option>
                    <option value="lighter">lighter</option>
                </select><br/>
                </>
            )}
            <button onClick={handleUp}>위로</button>
            <button onClick={handleDown}>아래로</button>
            <button onClick={handleAddEvent}>event</button>
        </div>
    )
}

