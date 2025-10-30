import { useEffect, useCallback, useRef } from 'react';
import * as fabric from 'fabric';

const DIRECTIONS = ['front', 'top', 'left', 'right', 'bottom'];

function createVertices(dir, frontPos, frontSize, frameEdge, frontEdge) {
  switch (dir) {
    case 'front':
      return [
        new fabric.Point(frontPos.left, frontPos.top),
        new fabric.Point(frontPos.left + frontSize.width, frontPos.top),
        new fabric.Point(frontPos.left + frontSize.width, frontPos.top + frontSize.height),
        new fabric.Point(frontPos.left, frontPos.top + frontSize.height),
      ];
    case 'top':
      return [
        new fabric.Point(frameEdge[0].x, frameEdge[0].y),
        new fabric.Point(frameEdge[1].x, frameEdge[1].y),
        new fabric.Point(frontEdge[1].x, frontEdge[1].y),
        new fabric.Point(frontEdge[0].x, frontEdge[0].y),
      ];
    case 'left':
      return [
        new fabric.Point(frameEdge[0].x, frameEdge[0].y),
        new fabric.Point(frontEdge[0].x, frontEdge[0].y),
        new fabric.Point(frontEdge[3].x, frontEdge[3].y),
        new fabric.Point(frameEdge[3].x, frameEdge[3].y),
      ];
    case 'right':
      return [
        new fabric.Point(frontEdge[1].x, frontEdge[1].y),
        new fabric.Point(frameEdge[1].x, frameEdge[1].y),
        new fabric.Point(frameEdge[2].x, frameEdge[2].y),
        new fabric.Point(frontEdge[2].x, frontEdge[2].y),
      ];
    case 'bottom':
      return [
        new fabric.Point(frontEdge[3].x, frontEdge[3].y),
        new fabric.Point(frontEdge[2].x, frontEdge[2].y),
        new fabric.Point(frameEdge[2].x, frameEdge[2].y),
        new fabric.Point(frameEdge[3].x, frameEdge[3].y),
      ];
    default:
      return [];
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
  imgs
) => {
  const dataUrlCache = useRef({});

  // 이미지 파일을 Data URL로 읽는 함수
  const loadImageDataUrl = (file) =>
    new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });

  // 초기화 및 perspective 상태 복원 함수
  const initializePerspectiveFromGame = useCallback(async () => {
    const canvas = canvasInstance.current;
    if (!canvas) return;
    if (!game?.room) return;
    if (!imgs || imgs.length === 0) return;

    const roomId = String(currentRoom);
    const sideId = String(currentSide);

    const room = game.room[currentRoom];
    if (!room) return;
    const side = room.side[currentSide];
    if (!side) return;

    const frame = side.frame;
    const edgeImgArray = frame?.edgeImg || [];
    const edgeArray = frame?.edge || [];

    const frontPosition = {
      left: frame?.x ?? 220,
      top: frame?.y ?? 120,
    };

    const frontSize = {
      width: frame?.width ?? 660,
      height: frame?.height ?? 420,
    };

    const frameEdgeWeight = {
      top: edgeArray[0] || 0,
      left: edgeArray[1] || 0,
      right: edgeArray[2] || 0,
      bottom: edgeArray[3] || 0,
    };

    const frameEdge = (!frame && !edgeArray) ? [
      { x: frontPosition.left - frameEdgeWeight.left, y: frontPosition.top - frameEdgeWeight.top },
      { x: frontPosition.left + frontSize.width + frameEdgeWeight.right, y: frontPosition.top - frameEdgeWeight.top },
      { x: frontPosition.left + frontSize.width + frameEdgeWeight.right, y: frontPosition.top + frontSize.height + frameEdgeWeight.bottom },
      { x: frontPosition.left - frameEdgeWeight.left, y: frontPosition.top + frontSize.height + frameEdgeWeight.bottom }
    ] : [
      { x: 220 - frameEdgeWeight.left, y: 120 - frameEdgeWeight.top },
      { x: 220 + 660 + frameEdgeWeight.right, y: 120 - frameEdgeWeight.top },
      { x: 220 + 660 + frameEdgeWeight.right, y: 120 + 420 + frameEdgeWeight.bottom },
      { x: 220 - frameEdgeWeight.left, y: 120 + 420 + frameEdgeWeight.bottom }
    ];

    const frontEdge = [
      { x: frontPosition.left, y: frontPosition.top },
      { x: frontPosition.left + frontSize.width, y: frontPosition.top },
      { x: frontPosition.left + frontSize.width, y: frontPosition.top + frontSize.height },
      { x: frontPosition.left, y: frontPosition.top + frontSize.height }
    ];

    // 1) 모든 이미지 Data URL을 병렬로 로딩
    const imagePromises = edgeImgArray.map(async (imageName, idx) => {
      if (!imageName) return null;
      if (!dataUrlCache.current[imageName]) {
        const file = imgs.find(f => f.name === imageName);
        if (!file) {
          console.warn(`[${roomId}][${sideId}][${imageName}] 파일을 찾을 수 없음`);
          return null;
        }
        dataUrlCache.current[imageName] = await loadImageDataUrl(file);
      }
      return {
        dir: DIRECTIONS[idx],
        imageName,
        imageUrl: dataUrlCache.current[imageName],
        vertices: createVertices(DIRECTIONS[idx], frontPosition, frontSize, frameEdge, frontEdge),
      };
    });

    const allImages = (await Promise.all(imagePromises)).filter(Boolean);

    // 2) fabric 캔버스 내 기존 polygon 제거 후 재생성 (필요시)
    if (canvas) {
      const polygons = canvas.getObjects().filter(obj => obj.type === 'polygon');
      polygons.forEach(p => canvas.remove(p));
      allImages.forEach(({ dir, vertices }) => {
        const polygon = new fabric.Polygon(vertices, {
          fill: 'rgba(0,0,0,0)',
          selectable: false,
          evented: false,
          wallType: dir,
        });
        canvas.add(polygon);
      });
      canvas.renderAll();
    }

    // 3) React 상태를 한 번만 업데이트
    const reconstructedPerspective = {
      [roomId]: {
        [sideId]: {},
      },
    };

    allImages.forEach(({ dir, imageName, imageUrl, vertices }) => {
      reconstructedPerspective[roomId][sideId][dir] = { imageName, imageUrl, vertices };
    });

    setPerspective(prev => {
      const prevSide = prev?.[roomId]?.[sideId];
      const nextSide = reconstructedPerspective[roomId][sideId];
      if (JSON.stringify(prevSide) === JSON.stringify(nextSide)) return prev;
      return {
        ...prev,
        [roomId]: {
          ...prev[roomId],
          [sideId]: nextSide,
        },
      };
    });
  }, [canvasInstance, game, imgs, setPerspective, currentRoom, currentSide]);

  // wall vertices 업데이트 함수 (디바운스 적용)
  const updateTimeout = useRef(null);
  const updatePerspectiveVertices = useCallback(() => {
    if (updateTimeout.current) clearTimeout(updateTimeout.current);
    updateTimeout.current = setTimeout(() => {
      const canvas = canvasInstance.current;
      if (!canvas) return;
      const walls = getWallsFromCanvas(canvas);
      if (!walls.length) return;

      setPerspective(prev => {
        const updated = { ...prev };
        if (!updated[currentRoom]) updated[currentRoom] = {};
        if (!updated[currentRoom][currentSide]) updated[currentRoom][currentSide] = {};

        walls.forEach(wall => {
          const wallType = wall.get('wallType');
          const vertices = getWallVertices(wall);
          if (vertices.length) {
            updated[currentRoom][currentSide][wallType] = {
              ...(updated[currentRoom][currentSide][wallType] || {}),
              vertices: [...vertices],
            };
          }
        });

        return updated;
      });
    }, 100);
  }, [canvasInstance, currentRoom, currentSide, getWallsFromCanvas, getWallVertices, setPerspective]);

  // effect 등록 및 해제
  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas) return;

    initializePerspectiveFromGame();

    canvas.on('object:added', updatePerspectiveVertices);
    canvas.on('object:modified', updatePerspectiveVertices);
    canvas.on('object:removed', updatePerspectiveVertices);

    updatePerspectiveVertices();

    return () => {
      canvas.off('object:added', updatePerspectiveVertices);
      canvas.off('object:modified', updatePerspectiveVertices);
      canvas.off('object:removed', updatePerspectiveVertices);
      if (updateTimeout.current) clearTimeout(updateTimeout.current);
    };
  }, [initializePerspectiveFromGame, updatePerspectiveVertices]);
};

export default useSyncPerspective;
