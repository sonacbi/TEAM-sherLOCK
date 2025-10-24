import { useEffect, useRef, useCallback } from 'react';
import * as fabric from 'fabric';

// -------------------------------------
// 1) 벽 방향 정의
// -------------------------------------
const DIRECTIONS = ['front', 'top', 'left', 'right', 'bottom'];

// -------------------------------------
// 2) vertices 생성 헬퍼 (frameEdge 절대 참조)
// -------------------------------------
function createVertices(dir, frameEdge) {
  const [tl, tr, br, bl] = frameEdge; // top-left, top-right, bottom-right, bottom-left
  switch (dir) {
    case 'front':
      return [tl, tr, br, bl].map(p => new fabric.Point(p.x, p.y));
    case 'top':
      return [tl, tr, tr, tl].map(p => new fabric.Point(p.x, p.y));
    case 'left':
      return [tl, bl, bl, tl].map(p => new fabric.Point(p.x, p.y));
    case 'right':
      return [tr, br, br, tr].map(p => new fabric.Point(p.x, p.y));
    case 'bottom':
      return [bl, br, br, bl].map(p => new fabric.Point(p.x, p.y));
    default:
      return [];
  }
}

// -------------------------------------
// 3) 이미지 파일 -> DataURL
// -------------------------------------
const loadImageDataUrl = (file) =>
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });

// -------------------------------------
// 4) 커스텀 훅 정의
// -------------------------------------
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
  const dataUrlCache = useRef({});
  const updateTimeout = useRef(null);

  // -------------------------------------
  // 4-1) 모든 room/side 초기화
  // -------------------------------------
  const initializeAllRoomsFromGame = useCallback(async () => {
    const canvas = canvasInstance.current;
    if (!canvas || !game?.room || !imgs?.length) return;

    const allPromises = [];
    Object.entries(game.room).forEach(([roomId, room]) => {
      Object.entries(room.side).forEach(([sideId, side]) => {
        const frame = side.frame || {};
        const frontPos = { left: frame.x ?? 220, top: frame.y ?? 120 };
        const frontSize = { width: frame.width ?? 660, height: frame.height ?? 420 };
        const edgeArray = frame.edge || [];

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

        DIRECTIONS.forEach((wallType, idx) => {
          allPromises.push((async () => {
            let dataUrl = null;
            const imgName = side.frame.edgeImg?.[idx] || null;

            if (imgName && !dataUrlCache.current[imgName]) {
              const file = imgs.find(f => f.name === imgName);
              if (file) dataUrlCache.current[imgName] = await loadImageDataUrl(file);
            }
            dataUrl = dataUrlCache.current[imgName] || null;

            const vertices = wallType === 'front'
              ? frontEdge.map(p => new fabric.Point(p.x, p.y))
              : createVertices(wallType, frameEdge);

            const polygon = new fabric.Polygon(vertices, {
              fill: 'rgba(0,0,0,0)',
              selectable: false,
              evented: false,
              wallType,
              _room: roomId,
              _side: sideId,
              _frameEdge: frameEdge,
            });

            return { polygon, roomId, sideId, wallType, imgName, vertices, dataUrl };
          })());
        });
      });
    });

    // polygon 모두 생성 후 canvas에 추가
    const results = await Promise.all(allPromises);
    results.forEach(({ polygon, vertices }) => {
      polygon.set({ points: vertices });
      polygon.dirty = true;
      canvas.add(polygon);
    });
    canvas.requestRenderAll(); // 여기서 첫 렌더링 반영

    // vertices 상태 반영
    if (isReadyToLoad) {
      const newState = {};
      results.forEach(({ roomId, sideId, wallType, imgName, vertices }) => {
        if (!newState[roomId]) newState[roomId] = {};
        if (!newState[roomId][sideId]) newState[roomId][sideId] = {};
        newState[roomId][sideId][wallType] = {
          imageName: imgName,
          imageUrl: dataUrlCache.current[imgName],
          vertices,
        };
      });
      setPerspective(prev => ({ ...prev, ...newState }));
      onLoadComplete?.(newState);

    }
  }, [canvasInstance, game, imgs, setPerspective, isReadyToLoad, onLoadComplete]);

  // -------------------------------------
  // 4-2) canvas 이벤트로 vertices 업데이트
  // -------------------------------------
  const updatePerspectiveVertices = useCallback(() => {
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
    updateTimeout.current = setTimeout(() => {
      const canvas = canvasInstance.current;
      if (!canvas) return;
      const walls = getWallsFromCanvas(canvas);
      if (!walls.length) return;

      setPerspective(prev => {
        const updated = { ...prev };
        walls.forEach(wall => {
          const wallType = wall.get('wallType');
          const vertices = getWallVertices(wall);
          if (!vertices.length) return;

          if (isReadyToLoad) {
            const roomId = wall._room;
            const sideId = wall._side;
            if (!updated[roomId]) updated[roomId] = {};
            if (!updated[roomId][sideId]) updated[roomId][sideId] = {};
            updated[roomId][sideId][wallType] = {
              ...(updated[roomId][sideId][wallType] || {}),
              vertices: [...vertices],
            };
          } else {
            if (!updated[currentRoom]) updated[currentRoom] = {};
            if (!updated[currentRoom][currentSide]) updated[currentRoom][currentSide] = {};
            updated[currentRoom][currentSide][wallType] = {
              ...(updated[currentRoom][currentSide][wallType] || {}),
              vertices: [...vertices],
            };
          }
        });
        return updated;
      });
    }, 100);
  }, [canvasInstance, currentRoom, currentSide, getWallsFromCanvas, getWallVertices, setPerspective, isReadyToLoad]);

  // -------------------------------------
  // 4-3) useEffect 등록
  // -------------------------------------
  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas) return;

    const runInitialization = async () => {
      canvas.off('object:added', updatePerspectiveVertices);
      canvas.off('object:modified', updatePerspectiveVertices);
      canvas.off('object:removed', updatePerspectiveVertices);

      await initializeAllRoomsFromGame();
      await new Promise(r => setTimeout(r, 0));

      canvas.renderAll();
      updatePerspectiveVertices();

      const debouncedUpdate = () => updatePerspectiveVertices();
      canvas.on('object:added', debouncedUpdate);
      canvas.on('object:modified', debouncedUpdate);
      canvas.on('object:removed', debouncedUpdate);
    };

    runInitialization();

    return () => {
      canvas.off('object:added', updatePerspectiveVertices);
      canvas.off('object:modified', updatePerspectiveVertices);
      canvas.off('object:removed', updatePerspectiveVertices);
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
    };
  }, [initializeAllRoomsFromGame, updatePerspectiveVertices, canvasInstance, isReadyToLoad, game]);
};

export default useSyncPerspective;
