import { useEffect } from 'react';
import * as fabric from 'fabric';

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
  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas) return;

    // 1. game 데이터 기반 초기 복원 함수
    const initializePerspectiveFromGame = async () => {
      if (!game || !game.room) return;
      if (!imgs || imgs.length === 0) return;

      const reconstructedPerspective = {};
      const directions = ['front', 'top', 'left', 'right', 'bottom'];

      for (let roomIdx = 0; roomIdx < game.room.length; roomIdx++) {
        const roomId = String(roomIdx);
        reconstructedPerspective[roomId] = reconstructedPerspective[roomId] || {};

        const room = game.room[roomIdx];
        for (let sideIdx = 0; sideIdx < room.side.length; sideIdx++) {
          const sideId = String(sideIdx);
          reconstructedPerspective[roomId][sideId] = {};

          const frame = room.side[sideIdx].frame;
          const edgeImgArray = room.side[sideIdx].frame?.edgeImg || [];
          const edgeArray = room.side[sideIdx].frame?.edge || [];

          // createRoomFrame 내부 변수 참고
          const frontPosition = {
            left: frame.x ?? 220,
            top: frame.y ?? 120,
          };

          const frontSize = {
            width: frame.width ?? 660,
            height: frame.height ?? 420,
          };

          // 벽 두께 (frameEdgeWeight)
          const frameEdgeWeight = {
            top: edgeArray[0] || 0,
            left: edgeArray[1] || 0,
            right: edgeArray[2] || 0,
            bottom: edgeArray[3] || 0,
          };

          const frameEdge = (!frame && !edgeArray) ? [
              { x: frontPosition.left - frameEdgeWeight.left,                     y: frontPosition.top - frameEdgeWeight.top },
              { x: frontPosition.left + frontSize.width + frameEdgeWeight.right,  y: frontPosition.top - frameEdgeWeight.top },
              { x: frontPosition.left + frontSize.width + frameEdgeWeight.right,  y: frontPosition.top + frontSize.height + frameEdgeWeight.bottom },
              { x: frontPosition.left - frameEdgeWeight.left,                     y: frontPosition.top + frontSize.height + frameEdgeWeight.bottom }
          ] : [
              { x: 220 - frameEdgeWeight.left,        y: 120 - frameEdgeWeight.top },
              { x: 220 + 660 + frameEdgeWeight.right, y: 120 - frameEdgeWeight.top },
              { x: 220 + 660 + frameEdgeWeight.right, y: 120 + 420 + frameEdgeWeight.bottom },
              { x: 220 - frameEdgeWeight.left,        y: 120 + 420 + frameEdgeWeight.bottom }
          ];

          const frontEdge = [
              { x: frontPosition.left, y: frontPosition.top },
              { x: frontPosition.left + frontSize.width, y: frontPosition.top },
              { x: frontPosition.left + frontSize.width, y: frontPosition.top + frontSize.height },
              { x: frontPosition.left, y: frontPosition.top + frontSize.height }
          ];

          for (let i = 0; i < directions.length; i++) {
            const dir = directions[i];
            const imageName = edgeImgArray[i];
            if (!imageName) continue;

            const file = imgs.find(f => f.name === imageName);
            if (!file) {
              console.warn(`[${roomId}][${sideId}][${dir}] 파일을 찾을 수 없음:`, imageName);
              continue;
            }

            // data URL 생성
            const dataUrl = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = () => resolve(reader.result);
              reader.readAsDataURL(file);
            });

            let vertices = [];

            // 방향별 꼭짓점 좌표 생성
            switch (dir) {
              case 'front':
                vertices = [
                  new fabric.Point(frontPosition.left, frontPosition.top),
                  new fabric.Point(frontPosition.left + frontSize.width, frontPosition.top),
                  new fabric.Point(frontPosition.left + frontSize.width, frontPosition.top + frontSize.height),
                  new fabric.Point(frontPosition.left, frontPosition.top + frontSize.height),
                ];
                break;

              case 'top':
                vertices = [
                  new fabric.Point(frameEdge[0]),
                  new fabric.Point(frameEdge[1]),
                  new fabric.Point(frontEdge[1]),
                  new fabric.Point(frontEdge[0]),
                ];
                break;

              case 'left':
                vertices = [
                  new fabric.Point(frameEdge[0]),
                  new fabric.Point(frontEdge[0]),
                  new fabric.Point(frontEdge[3]),
                  new fabric.Point(frameEdge[3]),
                ];
                break;

              case 'right':
                vertices = [
                  new fabric.Point(frontEdge[1]),
                  new fabric.Point(frameEdge[1]),
                  new fabric.Point(frameEdge[2]),
                  new fabric.Point(frontEdge[2]),
                ];
                break;

              case 'bottom':
                vertices = [
                  new fabric.Point(frontEdge[3]),
                  new fabric.Point(frontEdge[2]),
                  new fabric.Point(frameEdge[2]),
                  new fabric.Point(frameEdge[3]),
                ];
                break;
            }

            const polygon = new fabric.Polygon(vertices, {
              fill: 'rgba(0,0,0,0)',
              selectable: false,
              evented: false,
              wallType: dir,
            });
            canvas.add(polygon);

            reconstructedPerspective[roomId][sideId][dir] = {
              imageName,
              imageUrl: dataUrl,
              vertices,
            };

            console.log(`[Init] Room ${roomId} Side ${sideId} Dir ${dir}:`, reconstructedPerspective[roomId][sideId][dir]);
          }
        }
      }

      console.log('[Init] 최종 복원된 perspective:', reconstructedPerspective);
      setPerspective(reconstructedPerspective);
    };



    // 2. fabric canvas 변화 감지해서 실시간 동기화 함수
    const updatePerspectiveVertices = () => {
      const walls = getWallsFromCanvas(canvas);
      console.log('[🧱 updatePerspectiveVertices] walls:', walls);

      if (!walls.length) return;

      setPerspective(prev => {
        const updated = { ...prev };

        if (!updated[currentRoom]) updated[currentRoom] = {};
        if (!updated[currentRoom][currentSide]) updated[currentRoom][currentSide] = {};

        walls.forEach(wall => {
          const wallType = wall.get('wallType');
          const vertices = getWallVertices(wall);

          console.log(`[📐 update] wallType: ${wallType}`);
          console.log('    👉 vertices:', vertices);

          if (vertices.length) {
            updated[currentRoom][currentSide][wallType] = {
              ...(updated[currentRoom][currentSide][wallType] || {}),
              vertices: [...vertices],
            };
          }
        });

        console.log('[📝 updated perspective]:', updated);
        return updated;
      });
    };


    // 초기 복원 실행
    initializePerspectiveFromGame();

    // fabric 캔버스 이벤트에 등록
    canvas.on('object:added', updatePerspectiveVertices);
    canvas.on('object:modified', updatePerspectiveVertices);
    canvas.on('object:removed', updatePerspectiveVertices);

    // 초기 한 번 실행
    updatePerspectiveVertices();

    // cleanup
    return () => {
      canvas.off('object:added', updatePerspectiveVertices);
      canvas.off('object:modified', updatePerspectiveVertices);
      canvas.off('object:removed', updatePerspectiveVertices);
    };
  }, [canvasInstance, currentRoom, currentSide, game, imgs, getWallsFromCanvas, getWallVertices, setPerspective]);
};

export default useSyncPerspective;
