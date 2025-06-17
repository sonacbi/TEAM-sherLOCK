import './EditEventItem.css';

export default function EditEventItem({ event, index, eventValues, onChange, onRemove }) {
    const eventKey = Object.keys(event)[0];
    const eventData = eventValues?.[eventKey]; // Optional chaining

    if (!eventData) {
        console.warn('Invalid event or eventValues:', event);
        return null; // 또는 fallback UI
    }

    const eventName = eventData.name;
    const eventColor = eventData.color;

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
                        <div className='object_move'>
                            <p>→</p>

                            <div className='stage_move'>
                                <p>스테이지</p>
                                <input type="number" min={0} max={99} value={event.move?.room} onChange={e => onChange({ move: { room: Number(e.target.value), side: event.move?.side } })} />
                            </div>

                            <p>/</p>

                            <div className='cut_move'>
                                <p>컷</p>
                                <input type="number" min={0} max={99} value={event.move?.side} onChange={e => onChange({ move: { room: event.move?.room, side: Number(e.target.value) } })} />
                            </div>
                        </div>
                    </>
                )}
                {eventName === eventValues.appearObj.name && (
                    <>
                        <div className='object_appear'>
                            <p>이름 : </p>
                            <input value={event.appearObj?.name} onChange={e => onChange({ appearObj: { name: e.target.value } })} />
                        </div>
                    </>
                )}
                {eventName === eventValues.hideObj.name && (
                    <>
                        <div className='object_hide'>
                            <p>이름 : </p>
                            <input value={event.hideObj?.name} onChange={e => onChange({ hideObj: { name: e.target.value } })} />
                        </div>
                    </>
                )}
                {eventName === eventValues.removeObj.name && (
                    <>
                        <div className='object_remove'>
                            <p>이름 : </p>
                            <input value={event.removeObj?.name} onChange={e => onChange({ removeObj: { name: e.target.value } })} />
                        </div>
                    </>
                )}
                {eventName === eventValues.changeObj.name && (
                    <>  
                        <div className='object_change'>
                            <div className='before_name'>
                                <p>기존 이름 : </p>
                                <input value={event.changeObj?.from} onChange={e => onChange({ changeObj: { from: e.target.value, to: event.changeObj?.to } })} />
                            </div>

                            <div className='after_name'>
                                <p>바꿀 이름 : </p>
                                <input value={event.changeObj?.to} onChange={e => onChange({ changeObj: { from: event.changeObj?.from, to: e.target.value } })} />
                            </div>
                        </div>
                    </>
                )}
                {eventName === eventValues.getItem.name && (
                    <>
                        <div className='object_getItem'>
                            <p>이름: </p>
                            <input value={event.getItem?.name} onChange={e => onChange({ getItem: { name: e.target.value } })} />
                        </div>
                    </>
                )}
                {eventName === eventValues.dropItem.name && (
                    <>
                        <div className='object_dropItem'>
                            <p>이름: </p>
                            <input value={event.dropItem?.name} onChange={e => onChange({ dropItem: { name: e.target.value } })} />
                        </div>
                    </>
                )}
                {eventName === eventValues.startTime.name && (
                    <>
                        <div className='object_startTime'>
                            <p>타이머 이름 : </p>
                            <input value={event.startTime?.name} onChange={e => onChange({ startTime: { name: e.target.value, limit: event.startTime?.limit } })} />
                        </div>
                    </>
                )}
                {eventName === eventValues.endTime.name && (
                    <>
                        <div className='object_endTime'>
                            <p>타이머 이름 : </p>
                            <input value={event.endTime?.name} onChange={e => onChange({ endTime: { name: e.target.value } })} />
                        </div>
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
                {eventName === eventValues.save.name && <div><p>세이브포인트</p></div>}

                {eventName === eventValues.delay.name && (
                    <>
                        <div className='object_delay'>
                            <input type="number" value={event.delay?.time} onChange={e => onChange({ delay: { time: Number(e.target.value) } })} /> 
                            <p>ms (밀리초)</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
