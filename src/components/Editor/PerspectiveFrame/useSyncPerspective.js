// 파일: ./PerspectiveFrame/useSyncPerspective.js
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
    case 'front': return [tl, tr, br, bl].map(p => new fabric.Point(p.x, p.y));
    case 'top': return [tl, tr, tr, tl].map(p => new fabric.Point(p.x, p.y));
    case 'left': return [tl, bl, bl, tl].map(p => new fabric.Point(p.x, p.y));
    case 'right': return [tr, br, br, tr].map(p => new fabric.Point(p.x, p.y));
    case 'bottom': return [bl, br, br, bl].map(p => new fabric.Point(p.x, p.y));
    default: return [];
  }
}

// -------------------------------------
// 3) 커스텀 훅 정의
// -------------------------------------
const useSyncPerspective = (
  canvasInstance,        // fabric.Canvas ref
  getWallsFromCanvas,    // canvas에서 벽 객체 가져오는 함수
  getWallVertices,       // polygon 객체에서 vertices 가져오는 함수
  setPerspective,        // React state setter
  currentRoom,
  currentSide,
  game,                  // game 데이터
  imgs,                  // 이미지 파일 리스트
  isReadyToLoad,         // 초기 로딩 완료 여부
  onLoadComplete         // 초기 로딩 완료 콜백
) => {
  const firstUpdateDone = useRef(false); // 첫 렌더 강제 갱신 체크
  const dataUrlCache = useRef({});       // 이미지 DataURL 캐시

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

        // 4-1-1) frameEdge 계산
        const frameEdge = [
          { x: frontPos.left - (edgeArray[1] || 0), y: frontPos.top - (edgeArray[0] || 0) },
          { x: frontPos.left + frontSize.width + (edgeArray[2] || 0), y: frontPos.top - (edgeArray[0] || 0) },
          { x: frontPos.left + frontSize.width + (edgeArray[2] || 0), y: frontPos.top + frontSize.height + (edgeArray[3] || 0) },
          { x: frontPos.left - (edgeArray[1] || 0), y: frontPos.top + frontSize.height + (edgeArray[3] || 0) },
        ];

        // 4-1-2) front polygon 좌표
        const frontEdge = [
          { x: frontPos.left, y: frontPos.top },
          { x: frontPos.left + frontSize.width, y: frontPos.top },
          { x: frontPos.left + frontSize.width, y: frontPos.top + frontSize.height },
          { x: frontPos.left, y: frontPos.top + frontSize.height },
        ];

        // 4-1-3) 각 방향별 polygon 생성
        DIRECTIONS.forEach((wallType, idx) => {
          allPromises.push((async () => {
            const imgName = side.frame.edgeImg?.[idx] || null;

            // 이미지 파일이 존재하고 캐시에 없으면 읽어서 저장
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

            const vertices = wallType === 'front'
              ? frontEdge.map(p => new fabric.Point(p.x, p.y))
              : createVertices(wallType, frameEdge);

            // polygon 생성
            const polygon = new fabric.Polygon(vertices, {
              fill: 'rgba(0,0,0,0)',
              selectable: false,
              evented: false,
              wallType,
              _room: roomId,
              _side: sideId,
              _frameEdge: frameEdge,
              dataUrl,
            });

            return { polygon, roomId, sideId, wallType, vertices, dataUrl };
          })());
        });
      });
    });

    const results = await Promise.all(allPromises);

    // canvas에 polygon 추가
    results.forEach(({ polygon, vertices }) => {
      polygon.set({ points: vertices });
      polygon.dirty = true;
      canvas.add(polygon);
    });
    canvas.requestRenderAll();

    // -------------------------------------
    // 4-1-4) 첫 렌더링 강제 갱신
    // -------------------------------------
    if (!firstUpdateDone.current) {
      firstUpdateDone.current = true;
      setPerspective(prev => ({ ...prev })); // React state 갱신 트리거
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

  // -------------------------------------
  // 4-2) 캔버스 이벤트로 perspective 갱신
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

    // 최초 초기화
    initializeAllRoomsFromGame().catch(console.error);

    // canvas 이벤트 등록
    canvas.on('object:added', update);
    canvas.on('object:modified', update);
    canvas.on('object:removed', update);

    // cleanup
    return () => {
      canvas.off('object:added', update);
      canvas.off('object:modified', update);
      canvas.off('object:removed', update);
    };
  }, [canvasInstance, initializeAllRoomsFromGame, getWallsFromCanvas, getWallVertices, setPerspective, currentRoom, currentSide]);
};

export default useSyncPerspective;
