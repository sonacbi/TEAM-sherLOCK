// 파일: ./PerspectiveFrame/useSyncPerspective.js
import { useEffect, useRef, useCallback } from 'react';
import * as fabric from 'fabric';

const DIRECTIONS = ['front', 'top', 'left', 'right', 'bottom'];

function createVertices(dir, frameEdge) {
  const [tl, tr, br, bl] = frameEdge;
  switch (dir) {
    case 'front': return [tl, tr, br, bl].map(p => new fabric.Point(p.x, p.y));
    case 'top': return [tl, tr, tr, tl].map(p => new fabric.Point(p.x, p.y));
    case 'left': return [tl, bl, bl, tl].map(p => new fabric.Point(p.x, p.y));
    case 'right': return [tr, br, br, tr].map(p => new fabric.Point(p.x, p.y));
    case 'bottom': return [bl, br, br, bl].map(p => new fabric.Point(p.x, p.y));
    default: return [];
  }
}

const useSyncPerspective = (
  canvasInstance,
  getWallsFromCanvas,
  getWallVertices,
  setPerspective,
  currentRoom,
  currentSide,
  game,
  imgs,
  isReadyToLoad,
  onLoadComplete
) => {
  const firstUpdateDone = useRef(false);
  const dataUrlCache = useRef({});

  const initializeAllRoomsFromGame = useCallback(async () => {
    const canvas = canvasInstance.current;
    if (!canvas || !game?.room || !imgs?.length) return;

    const allPromises = [];

    // -------------------------------------
    // Room 단위 변환 구조
    // -------------------------------------
    const perspectiveState = game.room.map((room, roomIdx) => {
      const roomObj = {};
      room.side.forEach((side, sideIdx) => {
        const frame = side.frame || {};
        const frontPos = { left: frame.x ?? 220, top: frame.y ?? 120 };
        const frontSize = { width: frame.width ?? 660, height: frame.height ?? 420 };
        const edgeArray = frame.edge || [];
        const edgeImg = frame.edgeImg || [];

        const frameEdge = [
          { x: frontPos.left - (edgeArray[1] || 0), y: frontPos.top - (edgeArray[0] || 0) },
          { x: frontPos.left + frontSize.width + (edgeArray[2] || 0), y: frontPos.top - (edgeArray[0] || 0) },
          { x: frontPos.left + frontSize.width + (edgeArray[2] || 0), y: frontPos.top + frontSize.height + (edgeArray[3] || 0) },
          { x: frontPos.left - (edgeArray[1] || 0), y: frontPos.top + frontSize.height + (edgeArray[3] || 0) },
        ];

        const frontEdge = [
          { x: frontPos.left, y: frontPos.top },
          { x: frontPos.left + frontSize.width, y: frontPos.top },
          { x: frontPos.left + frontSize.width, y: frontPos.top + frontSize.height },
          { x: frontPos.left, y: frontPos.top + frontSize.height },
        ];

        // 각 방향별 초기 wall 데이터
        const sideData = {};
        DIRECTIONS.forEach((wallType, idx) => {
          sideData[wallType] = {
            vertices: wallType === 'front'
              ? frontEdge.map(p => new fabric.Point(p.x, p.y))
              : createVertices(wallType, frameEdge),
            imageUrl: edgeImg[idx] || null,
          };

          // polygon 생성
          allPromises.push((async () => {
            const imgName = edgeImg[idx] || null;
            if (imgName && !dataUrlCache.current[imgName]) {
              const file = imgs.find(f => f.name === imgName);
              if (file) {
                dataUrlCache.current[imgName] = await new Promise(r => {
                  const reader = new FileReader();
                  reader.onload = () => r(reader.result);
                  reader.readAsDataURL(file);
                });
              }
            }

            const dataUrl = dataUrlCache.current[imgName] || null;
            const vertices = sideData[wallType].vertices;

            const polygon = new fabric.Polygon(vertices, {
              fill: 'rgba(0,0,0,0)',
              selectable: false,
              evented: false,
              wallType,
              _room: roomIdx,
              _side: sideIdx,
              _frameEdge: frameEdge,
              dataUrl,
            });

            return { polygon, roomId: roomIdx, sideId: sideIdx, wallType, vertices, dataUrl };
          })());
        });

        roomObj[sideIdx] = sideData;
      });
      roomObj.currentRoom = String(roomIdx);
      return roomObj;
    });

    const results = await Promise.all(allPromises);

    results.forEach(({ polygon, vertices }) => {
      polygon.set({ points: vertices });
      polygon.dirty = true;
      canvas.add(polygon);
    });
    canvas.requestRenderAll();

    if (!firstUpdateDone.current) {
      firstUpdateDone.current = true;
      setPerspective(perspectiveState);
      onLoadComplete?.(results);
    } else if (isReadyToLoad) {
      const newState = {};
      results.forEach(({ roomId, sideId, wallType, vertices, dataUrl }) => {
        if (!newState[roomId]) newState[roomId] = {};
        if (!newState[roomId][sideId]) newState[roomId][sideId] = {};
        newState[roomId][sideId][wallType] = { vertices, imageUrl: dataUrl };
      });
      setPerspective(prev => ({ ...prev, ...newState }));
    }
  }, [canvasInstance, game, imgs, setPerspective, isReadyToLoad, onLoadComplete]);

  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas) return;

    const update = () => {
      const walls = getWallsFromCanvas(canvas);
      if (!walls.length) return;

      setPerspective(prev => {
        const updated = { ...prev };
        walls.forEach(wall => {
          const wallType = wall.get('wallType');
          const vertices = getWallVertices(wall);
          if (!vertices.length) return;

          const roomId = wall._room || currentRoom;
          const sideId = wall._side || currentSide;

          if (!updated[roomId]) updated[roomId] = {};
          if (!updated[roomId][sideId]) updated[roomId][sideId] = {};
          updated[roomId][sideId][wallType] = {
            ...(updated[roomId][sideId][wallType] || {}),
            vertices: [...vertices],
            imageUrl: wall.dataUrl || (updated[roomId][sideId][wallType]?.imageUrl || null),
          };
        });
        return updated;
      });
    };

    initializeAllRoomsFromGame().catch(console.error);

    canvas.on('object:added', update);
    canvas.on('object:modified', update);
    canvas.on('object:removed', update);

    return () => {
      canvas.off('object:added', update);
      canvas.off('object:modified', update);
      canvas.off('object:removed', update);
    };
  }, [canvasInstance, initializeAllRoomsFromGame, getWallsFromCanvas, getWallVertices, setPerspective, currentRoom, currentSide]);
};

export default useSyncPerspective;
