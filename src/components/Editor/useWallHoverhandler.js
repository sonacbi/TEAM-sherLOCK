import { useEffect } from 'react';
import * as fabric from 'fabric';
import { getWallsFromCanvas, getWallVertices, restoreWallStyle, getRectVertices } from './perspectiveBackground';
import { createRoomFrame } from '../../../modules/handlePolygon';

export function useWallHoverHandler({
  canvasInstance,
  hoveredWallLocal,
  originalStyles,
  isDragging,
  setHoveredWall,
  setHoveredWallVertices,
  setWalls,
  position, size, edgeFrameState, angle
}){

  // 방 프레임 그룹 생성 후, 내부 객체들을 순회하며 각 객체의 꼭지점 구하기
  const roomFrameGroup = createRoomFrame(
      ...position,
      ...size,
      ...edgeFrameState,
      angle
  );
  
  roomFrameGroup.getObjects().forEach((obj) => {
      let vertices;
      if (obj.type === 'polygon') {
          // 폴리곤은 points 배열을 fabric.Point로 변환
          vertices = obj.points.map(pt => new fabric.Point(pt.x, pt.y));
      } else if (obj.type === 'rect') {
          // 사각형은 getRectVertices 함수 사용
          vertices = getRectVertices(obj);
      }
      // console.log(obj.wallType, vertices);
  });


  // 캔버스 이벤트 등록 및 상태 관리용 useEffect
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const canvasWidth = canvas.getWidth();
        const canvasHeight = canvas.getHeight();

        // 초기 벽 목록을 상태로 세팅
        setWalls(getWallsFromCanvas(canvas));

        // 오브젝트 이동 시작 시 드래그 상태 true
        const onObjectMoving = () => {
            isDragging.current = true;
        };

        // 마우스 버튼 떼면 드래그 종료, 스타일 복원
        const onMouseUp = () => {
            isDragging.current = false;
            restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);

            // 드롭 시점에서 hoveredWallLocal 존재하면
            // WebGL 4점 왜곡 확정 로직 가능 (추가 처리 위치)
        };

        // 마우스 이동 시, 드래그 중이면 벽 위에 마우스가 있는지 체크
        const onMouseMove = opt => {
            if (!isDragging.current) return;

            const pointer = canvas.getPointer(opt.e);
            const currentWalls = getWallsFromCanvas(canvas);

            // 마우스 위치가 포함된 벽 객체 찾기 (containsPoint 함수 사용)
            const wallUnderPointer = currentWalls.find(wall => wall.containsPoint(pointer));

            if (wallUnderPointer && wallUnderPointer !== hoveredWallLocal.current) {
                // 이전 호버 스타일 복원
                restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);

                 // 새 호버 객체로 교체
                hoveredWallLocal.current = wallUnderPointer;

                // 새로 호버된 객체 스타일 원본 저장
                if (!originalStyles.current.has(wallUnderPointer)) {
                    originalStyles.current.set(wallUnderPointer, {
                        fill: wallUnderPointer.fill,
                        stroke: wallUnderPointer.stroke,
                    });
                }

                // 새 호버된 벽 객체 스타일 변경 (하이라이트)
                wallUnderPointer.set({
                    fill: 'rgba(180,180,180,0.7)',
                    stroke: '#555',
                });

                hoveredWallLocal.current = wallUnderPointer;
                setHoveredWall(wallUnderPointer);

                // 1) 벽의 로컬 좌표 꼭지점 배열 계산
                const vertices = getWallVertices(wallUnderPointer);

                // 3) 꼭지점 좌표에 오프셋(회전+이동) 적용
                // const offsetVertices = applyOffsetToVertices(vertices, wallUnderPointer);
                // console.log('offsetVertices:', offsetVertices);

                setHoveredWallVertices(vertices);

                canvas.renderAll();
            }

            // 벽 객체가 없으면 호버 상태 초기화
            if (!wallUnderPointer && hoveredWallLocal.current) {
                restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);
                hoveredWallLocal.current = null;
                setHoveredWall(null);
                setHoveredWallVertices([]);
            }
        };

        // 이벤트 등록
        canvas.on('object:moving', onObjectMoving);
        canvas.on('mouse:up', onMouseUp);
        canvas.on('mouse:move', onMouseMove);

        // 클린업 함수 (컴포넌트 언마운트 시 이벤트 제거)
        return () => {
            canvas.off('object:moving', onObjectMoving);
            canvas.off('mouse:up', onMouseUp);
            canvas.off('mouse:move', onMouseMove);
        };
    }, [canvasInstance, hoveredWallLocal, originalStyles, isDragging, setHoveredWall, setHoveredWallVertices, setWalls]); // edgeFrameState 변경 시 재실행
}