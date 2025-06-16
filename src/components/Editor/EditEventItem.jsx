import './EditEventItem.css';

export default function EditEventItem({ event, index, eventValues, onChange, onRemove }) {
    const eventName = eventValues[Object.keys(event)[0]].name;
    const eventColor = eventValues[Object.keys(event)[0]].color;

    return (
        <div className="event-item" style={{ backgroundColor: eventColor || "transparent" }}>
            <div className="event_header">
                <h4>Event {index + 1}</h4>
                <p>{eventName}</p>
                <button onClick={onRemove}>X</button>
            </div>

            <div className="event-fields">
                {eventName === eventValues.move.name && (
                    <>
                        스테이지: <input type="number" min={0} max={99} value={event.move?.room} onChange={e => onChange({ move: { room: Number(e.target.value), side: event.move?.side } })} />
                        컷: <input type="number" min={0} max={99} value={event.move?.side} onChange={e => onChange({ move: { room: event.move?.room, side: Number(e.target.value) } })} />
                    </>
                )}
                {eventName === eventValues.appearObj.name && (
                    <>
                        이름: <input value={event.appearObj?.name} onChange={e => onChange({ appearObj: { name: e.target.value } })} />
                    </>
                )}
                {eventName === eventValues.hideObj.name && (
                    <>
                        이름: <input value={event.hideObj?.name} onChange={e => onChange({ hideObj: { name: e.target.value } })} />
                    </>
                )}
                {eventName === eventValues.removeObj.name && (
                    <>
                        이름: <input value={event.removeObj?.name} onChange={e => onChange({ removeObj: { name: e.target.value } })} />
                    </>
                )}
                {eventName === eventValues.changeObj.name && (
                    <>
                        기존 이름: <input value={event.changeObj?.from} onChange={e => onChange({ changeObj: { from: e.target.value, to: event.changeObj?.to } })} />
                        바꿀 이름: <input value={event.changeObj?.to} onChange={e => onChange({ changeObj: { from: event.changeObj?.from, to: e.target.value } })} />
                    </>
                )}
                {eventName === eventValues.getItem.name && (
                    <>
                        아이템 이름: <input value={event.getItem?.name} onChange={e => onChange({ getItem: { name: e.target.value } })} />
                    </>
                )}
                {eventName === eventValues.dropItem.name && (
                    <>
                        아이템 이름: <input value={event.dropItem?.name} onChange={e => onChange({ dropItem: { name: e.target.value } })} />
                    </>
                )}
                {eventName === eventValues.startTime.name && (
                    <>
                        타이머 이름: <input value={event.startTime?.name} onChange={e => onChange({ startTime: { name: e.target.value, limit: event.startTime?.limit } })} />
                        제한 시간: <input type="number" min={0} max={1000*60} value={event.startTime?.limit} onChange={e => onChange({ startTime: { name: event.startTime?.name, limit: Number(e.target.value) } })} /> 밀리초
                    </>
                )}
                {eventName === eventValues.endTime.name && (
                    <>
                        멈출 타이머 이름: <input value={event.endTime?.name} onChange={e => onChange({ endTime: { name: e.target.value } })} />
                    </>
                )}
                {/* {eventName === eventValues.endTime.name && (
                    <>
                        소리 이름: <input value={event.startSound?.name} onChange={e => handleInputChange("name", e.target.value)} />
                        볼륨: <input type="number" min={0} max={1} value={event.startSound?.volume} step={0.01} onChange={e => handleInputChange("volume", Number(e.target.value))} />
                    </>
                )}
                {eventName === eventValues.endTime.name && (
                    <>
                        정지할 소리 이름: <input value={event.endSound} onChange={e => onChange({ endSound: e.target.value })} />
                    </>
                )} */}
                {eventName === eventValues.save.name && <p>저장은 별도 설정 없음</p>}
                {eventName === eventValues.delay.name && (
                    <>
                        시간: <input type="number" value={event.delay?.time} onChange={e => onChange({ delay: { time: Number(e.target.value) } })} /> 밀리초
                    </>
                )}
            </div>
        </div>
    );
}
