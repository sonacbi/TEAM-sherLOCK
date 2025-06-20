import { useState } from 'react';
import './EditEventItem.css';

import event_search_icon from '../../assets/images/ThemePage_img/search_icon.png';

export default function EditEventItem({ event, index, eventValues, namedFabrics, onChange, onRemove }) {
    const eventKey = Object.keys(event)[0];
    const eventData = eventValues?.[eventKey]; // Optional chaining

    if (!eventData) {
        console.warn('Invalid event or eventValues:', event);
        return null; // 또는 fallback UI
    }

    const [display, setDisplay] = useState(eventData.name == eventValues.changeObj.name);
    const [displayFrom, setDisplayFrom] = useState(false);
    const [displayTo, setDisplayTo] = useState(false);

    const eventName = eventData.name;
    const eventColor = eventData.color;

    const thinkToChange = (eventName, data) => {
        if (eventName == 'from') onChange({ changeObj: { from: data, to: event?.changeObj?.to }});
        else if (eventName == 'to') onChange({ changeObj: { from: event?.changeObj?.from, to: data }});
        else onChange({ [eventName]: data });
    }

    const FoundFabricName = ({fabricId, eventName}) => {
        const [keyword, setKeyword] = useState('');
        const filteredFabrics = namedFabrics.filter(fabric =>
            fabric.name.toLowerCase().includes(keyword.toLowerCase())
        );

        const sortedFabrics = [...filteredFabrics].sort((a, b) => {
            if (a.id === fabricId) return -1;
            if (b.id === fabricId) return 1;
            return 0;
        });

        return(
            <div className={`fabricName-box ${display && 'show'}`}>
                <ul className='fabricName-list'>
                    <li className='fabricName-search'>
                        <img id='event_search_icon' src={event_search_icon} alt='event_search_icon' />
                        <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)}/>
                    </li>
                    {filteredFabrics.length === 0 ? (<div className='no_object'>객체가 없습니다.</div>) 
                    :
                    <div className='fabricName-item-wrap'>
                        {sortedFabrics.map((data, index) => (
                            <li
                            key={index}
                            className={`fabricName-item ${fabricId === data.id ? 'selected' : ''}`}
                            onClick={() => thinkToChange(eventName, { id: data.id })}
                            >
                            {data.name}
                            <span>#{data.id}</span>
                            </li>
                        ))}
                    </div>
                    }
                </ul>
            </div>
        )
    }

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
                        <div className='object_appear have-fabricName'>
                            <label>
                                <p>이름 : </p>
                                <input value={namedFabrics.find(item => item.id == event.appearObj?.id)?.name} onClick={()=>setDisplay(prev=>!prev)} readOnly/>
                            </label>
                            <FoundFabricName fabricId={event.appearObj?.id} eventName='appearObj'/>
                        </div>
                    </>
                )}
                {eventName === eventValues.hideObj.name && (
                    <>
                        <div className='object_hide have-fabricName'>
                            <label>
                                <p>이름 : </p>
                                <input value={namedFabrics.find(item => item.id == event.hideObj?.id)?.name} onClick={()=>setDisplay(prev=>!prev)} readOnly/>
                            </label>
                            <FoundFabricName fabricId={event.hideObj?.id} eventName='hideObj'/>
                        </div>
                    </>
                )}
                {eventName === eventValues.removeObj.name && (
                    <>
                        <div className='object_remove have-fabricName'>
                            <label>
                                <p>이름 : </p>
                                <input value={namedFabrics.find(item => item.id == event.removeObj?.id)?.name} onClick={()=>setDisplay(prev=>!prev)} readOnly/>
                            </label>
                            <FoundFabricName fabricId={event.removeObj?.id} eventName='removeObj'/>
                        </div>
                    </>
                )}
                {eventName === eventValues.changeObj.name && (
                    <>  
                        <div className='object_change'>
                            <div className='before_name have-fabricName'>
                                <label>
                                    <p>기존 이름 : </p>
                                    <input value={namedFabrics.find(item => item.id == event?.changeObj?.from?.id)?.name} onClick={()=>setDisplayFrom(prev=>!prev)} readOnly/>
                                </label>
                                <div style={{display: `${displayFrom ? '' : 'none'}`}}>
                                <FoundFabricName fabricId={event?.changeObj?.from?.id} eventName='from'/>
                                </div>
                            </div>

                            <div className='after_name have-fabricName'>
                                <label>
                                    <p>바꿀 이름 : </p>
                                    <input value={namedFabrics.find(item => item.id == event?.changeObj?.to?.id)?.name} onClick={()=>setDisplayTo(prev=>!prev)} readOnly/>
                                </label>
                                <div style={{display: `${displayTo ? '' : 'none'}`}}>
                                <FoundFabricName fabricId={event?.changeObj?.to?.id} eventName='to'/>
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {eventName === eventValues.getItem.name && (
                    <>
                        <div className='object_getItem have-fabricName'>
                            <label>
                                <p>이름 : </p>
                                <input value={namedFabrics.find(item => item.id == event.getItem?.id)?.name} onClick={()=>setDisplay(prev=>!prev)} readOnly/>
                            </label>
                            <FoundFabricName fabricId={event.getItem?.id} eventName='getItem'/>
                        </div>
                    </>
                )}
                {eventName === eventValues.dropItem.name && (
                    <>
                        <div className='object_dropItem have-fabricName'>
                            <label>
                                <p>이름 : </p>
                                <input value={namedFabrics.find(item => item.id == event.dropItem?.id)?.name} onClick={()=>setDisplay(prev=>!prev)} readOnly/>
                            </label>
                            <FoundFabricName fabricId={event.dropItem?.id} eventName='dropItem'/>
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
