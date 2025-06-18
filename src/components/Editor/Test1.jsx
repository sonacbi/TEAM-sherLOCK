// *http://localhost:5173/Test* 으로 reorder 테스트 가능 확인하고 router에서 지워주세요
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import _ from 'lodash';

const initialGame = {
  room: [
    {
      id: 'room-1',
      name: 'Room 1',
      side: [
        { id: 'side-1-1', name: 'Side 1-1' },
        { id: 'side-1-2', name: 'Side 1-2' },
      ],
    },
    {
      id: 'room-2',
      name: 'Room 2',
      side: [
        { id: 'side-2-1', name: 'Side 2-1' },
        { id: 'side-2-2', name: 'Side 2-2' },
      ],
    },
  ],
};

const initialSideImgSrcs = [
  ['url1-1', 'url1-2'], // room 1 side images
  ['url2-1', 'url2-2'], // room 2 side images
];

function SideReorderExample() {
  const [game, setGame] = useState(initialGame);
  const [sideImgSrcs, setSideImgSrcs] = useState(initialSideImgSrcs);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination, type } = result;

    if (type === 'room') {
      // 방 순서 변경
      const updatedRooms = _.cloneDeep(game.room);
      const [movedRoom] = updatedRooms.splice(source.index, 1);
      updatedRooms.splice(destination.index, 0, movedRoom);

      setGame(prev => ({
        ...prev,
        room: updatedRooms,
      }));

      // 이미지 배열도 같이 변경
      const updatedImgs = [...sideImgSrcs];
      const [movedImgs] = updatedImgs.splice(source.index, 1);
      updatedImgs.splice(destination.index, 0, movedImgs);
      setSideImgSrcs(updatedImgs);
    }

    if (type === 'side') {
      // droppableId: "side-{roomIndex}"
      const roomIndex = parseInt(source.droppableId.split('-')[1]);
      const updatedRooms = _.cloneDeep(game.room).map((room, idx) => {
        if (idx !== roomIndex) return room;

        const newSides = [...room.side];
        const [movedSide] = newSides.splice(source.index, 1);
        newSides.splice(destination.index, 0, movedSide);

        return {
          ...room,
          side: newSides,
        };
      });

      setGame(prev => ({
        ...prev,
        room: updatedRooms,
      }));

      // 이미지도 같은 순서로 변경
      setSideImgSrcs(prev => {
        const newImgs = [...prev];
        const sideImgs = [...newImgs[roomIndex]];
        const [movedImg] = sideImgs.splice(source.index, 1);
        sideImgs.splice(destination.index, 0, movedImg);
        newImgs[roomIndex] = sideImgs;
        return newImgs;
      });
    }
  };

  return (
    <div style={{ margin: 'auto', width: 400 }}>
      <h3>Room & Side reorder test</h3>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="room" type="room">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} style={{ padding: 10, background: '#eee' }}>
              {game.room.map((roomData, roomIndex) => (
                <Draggable
                  key={roomData.id}
                  draggableId={roomData.id}
                  index={roomIndex}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        userSelect: 'none',
                        padding: 10,
                        marginBottom: 10,
                        background: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: 4,
                        ...provided.draggableProps.style,
                      }}
                    >
                      <div>
                        <strong>{roomData.name}</strong>
                      </div>
                      <Droppable droppableId={`side-${roomIndex}`} type="side">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            style={{ paddingLeft: 10, marginTop: 8, background: '#f9f9f9' }}
                          >
                            {roomData.side.map((sideData, sideIndex) => (
                              <Draggable
                                key={sideData.id}
                                draggableId={sideData.id}
                                index={sideIndex}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      userSelect: 'none',
                                      padding: 8,
                                      marginBottom: 6,
                                      background: snapshot.isDragging ? '#a0c4ff' : '#fff',
                                      border: '1px solid #ccc',
                                      borderRadius: 3,
                                      ...provided.draggableProps.style,
                                    }}
                                  >
                                    {sideData.name}
                                    <img
                                      src={sideImgSrcs[roomIndex][sideIndex]}
                                      alt=""
                                      width={60}
                                      style={{ marginLeft: 8 }}
                                    />
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}

export default SideReorderExample;
