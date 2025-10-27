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

  // -------------------------------------
  // Room 단위 전체 초기화
  // -------------------------------------
  const initializeAllRoomsFromGame = useCallback(async () => {
    const canvas = canvasInstance.current;
    if (!canvas || !game?.room || !imgs?.length) return;

    const allPromises = [];
    const perspectiveState = game.room.map(() => ({}));

    game.room.forEach((room, roomIdx) => {
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

        if (!perspectiveState[roomIdx][sideIdx]) perspectiveState[roomIdx][sideIdx] = {};

        // -------------------------------------
        // 각 면(DIRECTIONS)별 polygon 생성
        // -------------------------------------
        DIRECTIONS.forEach((wallType, idx) => {
          const imgName = edgeImg[idx] || null;
          const vertices = wallType === 'front'
            ? frontEdge.map(p => new fabric.Point(p.x, p.y))
            : createVertices(wallType, frameEdge);

          allPromises.push(
            (async () => {
              let dataUrl = null;
              if (imgName) {
                if (!dataUrlCache.current[imgName]) {
                  const file = imgs.find(f => f.name === imgName);
                  if (file) {
                    dataUrlCache.current[imgName] = await new Promise(r => {
                      const reader = new FileReader();
                      reader.onload = () => r(reader.result);
                      reader.readAsDataURL(file);
                    });
                  }
                }
                dataUrl = dataUrlCache.current[imgName] || null;
              }

              perspectiveState[roomIdx][sideIdx][wallType] = {
                vertices,
                imageUrl: dataUrl, // ✅ dataURL 포함
              };

              // Polygon은 나중에 한 번에 canvas에 추가
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

              return polygon;
            })()
          );
        });
      });
    });

    // -------------------------------------
    // 모든 Polygon 생성 완료 후 한 번에 추가
    // -------------------------------------
    const polygons = await Promise.all(allPromises);
    polygons.forEach(p => canvas.add(p));
    canvas.requestRenderAll();

    if (!firstUpdateDone.current) {
      firstUpdateDone.current = true;
      setPerspective(perspectiveState); // ✅ data:~ 포함된 상태로 저장됨
      onLoadComplete?.(polygons);
    }
  }, [canvasInstance, game, imgs, setPerspective, onLoadComplete]);

  // -------------------------------------
  // Canvas 객체 변경 감시
  // -------------------------------------
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
