import { useState } from "react";

import { GameEventType } from "../../../modules/editor/gamePnC";

export default function EditEventItem({ event, index, onChange, onRemove }) {
    const [type, setType] = useState(getEventType(event));

    function getEventType(eventObj) {
        if (!eventObj) return "";
        return Object.keys(eventObj).find(key => eventObj[key] !== undefined && eventObj[key] !== null) || "";
    }

    function handleTypeChange(e) {
        const selected = e.target.value;
        setType(selected);
        onChange({ [selected]: GameEventType[selected] });
    }

    function handleInputChange(path, value) {
        const updated = { [type]: { ...(event[type] || {}) } };

        if (typeof path === "string") {
            updated[type][path] = value;
        } else if (Array.isArray(path)) {
            let ref = updated[type];
            for (let i = 0; i < path.length - 1; i++) {
                ref = ref[path[i]];
            }
            ref[path[path.length - 1]] = value;
        }

        onChange(updated);
    }

    return (
        <div className="event-item">
            <h4>이벤트 {index + 1}</h4>
            <select value={type} onChange={handleTypeChange}>
                {/* <option value="">선택</option> */}
                <option value="move">이동</option>
                <option value="getObj">객체 얻기</option>
                <option value="setObj">객체 변경</option>
                <option value="dropObj">객체 제거</option>
                <option value="getItem">아이템 얻기</option>
                <option value="dropItem">아이템 제거</option>
                <option value="startTime">타이머 시작</option>
                <option value="endTime">타이머 종료</option>
                <option value="startSound">소리 재생</option>
                <option value="endSound">소리 정지</option>
                <option value="save">저장</option>
            </select>
            <button onClick={onRemove}>삭제</button>

            <div className="event-fields">
                {type === "move" && (
                    <>
                        방: <input type="number" min={0} max={99} value={event.move?.room} onChange={e => handleInputChange("room", e.target.value)} />
                        방향: <input type="number" min={0} max={99} value={event.move?.side} onChange={e => handleInputChange("side", e.target.value)} />
                    </>
                )}
                {type === "getObj" && (
                    <>
                        이름: <input value={event.getObj?.name} onChange={e => handleInputChange("name", e.target.value)} />
                        X: <input type="number" value={event.getObj?.x} onChange={e => handleInputChange("x", Number(e.target.value))} />
                        Y: <input type="number" value={event.getObj?.y} onChange={e => handleInputChange("y", Number(e.target.value))} />
                        scaleX: <input type="number" value={event.getObj?.scaleX} onChange={e => handleInputChange("scaleX", Number(e.target.value))} />
                        scaleY: <input type="number" value={event.getObj?.scaleY} onChange={e => handleInputChange("scaleY", Number(e.target.value))} />
                    </>
                )}
                {type === "setObj" && (
                    <>
                        기존 이름: <input value={event.setObj?.from} onChange={e => handleInputChange(["from"], e.target.value)} />
                        바꿀 이름: <input value={event.setObj?.to?.name} onChange={e => handleInputChange(["to", "name"], e.target.value)} />
                        scaleX: <input type="number" value={event.setObj?.to?.scaleX} onChange={e => handleInputChange(["to", "scaleX"], Number(e.target.value))} />
                        scaleY: <input type="number" value={event.setObj?.to?.scaleY} onChange={e => handleInputChange(["to", "scaleY"], Number(e.target.value))} />
                    </>
                )}
                {type === "dropObj" && (
                    <>
                        삭제할 이름: <input value={event.dropObj} onChange={e => onChange({ dropObj: e.target.value })} />
                    </>
                )}
                {type === "getItem" && (
                    <>
                        아이템 이름: <input value={event.getItem} onChange={e => onChange({ getItem: e.target.value })} />
                    </>
                )}
                {type === "dropItem" && (
                    <>
                        삭제할 아이템 이름: <input value={event.dropItem} onChange={e => onChange({ dropItem: e.target.value })} />
                    </>
                )}
                {type === "startTime" && (
                    <>
                        타이머 이름: <input value={event.startTime?.name} onChange={e => handleInputChange("name", e.target.value)} />
                        제한 시간: <input type="number" min={0} max={99} value={event.startTime?.limit} onChange={e => handleInputChange("limit", Number(e.target.value))} />
                    </>
                )}
                {type === "endTime" && (
                    <>
                        멈출 타이머 이름: <input value={event.endTime} onChange={e => onChange({ endTime: e.target.value })} />
                    </>
                )}
                {type === "startSound" && (
                    <>
                        소리 이름: <input value={event.startSound?.name} onChange={e => handleInputChange("name", e.target.value)} />
                        볼륨: <input type="number" min={0} max={1} value={event.startSound?.volume} step={0.01} onChange={e => handleInputChange("volume", Number(e.target.value))} />
                    </>
                )}
                {type === "endSound" && (
                    <>
                        정지할 소리 이름: <input value={event.endSound} onChange={e => onChange({ endSound: e.target.value })} />
                    </>
                )}
                {type === "save" && <p>저장은 별도 설정 없음</p>}
            </div>
        </div>
    );
}
