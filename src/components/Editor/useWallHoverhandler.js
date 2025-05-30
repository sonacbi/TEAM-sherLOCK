import { useEffect, useState, useRef } from 'react';
import * as fabric from 'fabric';
import { getWallsFromCanvas, getWallVertices, restoreWallStyle, getRectVertices } from './perspectiveBackground';
import { createRoomFrame } from '../../../modules/handlePolygon';

export function useWallHoverHandler({
    canvasInstance,
    hoveredWallLocal, // 현재 마우스가 호버중인 벽 객체 저장 (이벤트 핸들러 전용)
    originalStyles, // 호버된 벽의 원래 스타일을 저장하는 Map (객체별)
    isDragging, // React 훅에서 드래그 상태 저장용 useRef
    setHoveredWall, // 현재 호버된 벽 객체 상태
    setHoveredWallVertices, // 현재 호버된 벽의 꼭지점 좌표 (WebGL 컴포넌트 전달용)
    position, size, edgeFrameState, angle,
    selectedTool,
    perspective, perspectiveRef,
    setPerspective,
  
}) {

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

  const [previewPerspective, setPreviewPerspective] = useState({}); // 임시 미리보기용
  // 이전 호버한 벽 정보
  const preHoveredWall = useRef(null);
  const latestImageUrl = useRef('');

  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas || selectedTool !== 'frame') return;

    const onObjectMoving = (e) => {
        const movingObj = e.target;
        if (!movingObj) return;

        // 이미지 객체인지 확인 (예: movingObj.type === 'image')
        if (movingObj.type === 'image') {
          isDragging.current = true;
          console.log('[object:moving] 이미지 드래그 시작');
          
          const src = movingObj.getSrc ? movingObj.getSrc() : movingObj.imageUrl;
          latestImageUrl.current = src;  // 최신 값을 useRef로 저장

          // 현재 호버중인 벽이 있고, 그 벽에 이미지가 이미 확정되어 있다면 변경 막기
          const currentWall = hoveredWallLocal.current;
          if (currentWall && perspective[currentWall.wallType]?.imageUrl) {
            // 이미지가 이미 확정된 벽 → 이미지 변경 막음
            return;
          }


        } else {
          isDragging.current = false; // 이미지가 아니면 드래그 아님
          latestImageUrl.current = '';
        }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      console.log('[mouse:up] 드래그 종료');
      restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);

      if (hoveredWallLocal.current) {
        const wall = hoveredWallLocal.current;
        const vertices = getWallVertices(wall);

        // 확정된 이미지가 있으면 변경 안 함
        if (perspectiveRef.current[wall.wallType]?.imageUrl) {
          console.log(`[mouse:up] 이미지가 이미 확정되어 변경하지 않음: ${wall.wallType}`);
          setPreviewPerspective({});
          // 호버 플래그 초기화
          hoveredWallLocal.current = null;
          setHoveredWall(null);
          setHoveredWallVertices([]);
          return;
        }
        // ✅ 여기서 드래그한 벽과 이미지 URL을 perspective에 저장
        setPerspective(prev => ({
          ...prev,
          [wall.wallType]: {
            ...prev[wall.wallType],
            vertices: vertices,
            imageUrl: latestImageUrl.current || prev[wall.wallType]?.imageUrl || ''
          }
        }));
        
      // 이미지 확정된 벽을 투명하게 만들기
      if (latestImageUrl.current) {
        wall.set({
          fill: 'rgba(0,0,0,0)',
          stroke: null,
          selectable: false,
          evented: false,
        });
        if (wall.wallType === 'front') {
        // 캔버스 상의 roomController 인스턴스에 직접 적용
        const controllerObj = canvas.getObjects().find(obj => obj.name === 'SherLockRoomController');
        if (controllerObj) {
          controllerObj.set({
            fill: 'rgba(0,0,0,0)',
            stroke: 'rgba(0,0,0,0)',
          });
        }
      }

        canvas.renderAll();

        console.log(`[mouse:up] ${wall.wallType} 벽을 이미지 확정으로 투명하게 설정`);
      }
        setPreviewPerspective({});  // 미리보기 초기화
        console.log(`[mouse:up] perspective 저장됨: ${wall.wallType}`, vertices, latestImageUrl.current);
      }
      
      // 호버 플래그 초기화
      hoveredWallLocal.current = null;
      setHoveredWall(null);
      setHoveredWallVertices([]);
    };

    const onMouseMove = opt => {
      if (!isDragging.current) return;

      const pointer = canvas.getPointer(opt.e);
      const currentWalls = getWallsFromCanvas(canvas);
      const wallUnderPointer = currentWalls.find(wall => wall.containsPoint(pointer));

      console.log('[mouse:move] 포인터 위치:', pointer);
      console.log('[mouse:move] 감지된 벽:', wallUnderPointer?.wallType || '없음');

      if (wallUnderPointer === hoveredWallLocal.current) {
        console.log('[mouse:move] 동일한 벽이므로 무시');
        return;
      }

      // 이전 벽 스타일 복원
      restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);
      console.log('[mouse:move] 이전 벽 스타일 복원 완료');

        // // 이전 벽의 perspective 정보 초기화
        const prevWallType = preHoveredWall.current?.wallType;
          if (prevWallType) {
            setPreviewPerspective(prev => ({
              ...prev,
              [prevWallType]: { vertices: [], imageUrl: '' },
            }));
          }

      if (wallUnderPointer) {
        hoveredWallLocal.current = wallUnderPointer;
        preHoveredWall.current = wallUnderPointer;  // 업데이트

        if (!originalStyles.current.has(wallUnderPointer)) {
          originalStyles.current.set(wallUnderPointer, {
            fill: wallUnderPointer.fill,
            stroke: wallUnderPointer.stroke,
          });
          console.log('[mouse:move] 원래 스타일 저장');
        }

        wallUnderPointer.set({
          fill: 'rgba(180,180,180,0.7)',
          stroke: '#555',
        });

        const vertices = getWallVertices(wallUnderPointer);
        setHoveredWall(wallUnderPointer);
        setHoveredWallVertices(vertices);
        canvas.renderAll();

        // 여기서는 실제 상태 변경이 아닌 미리보기만 업데이트
         // 이전 상태와 같은지 비교
        setPreviewPerspective(prev => {
          const prevData = prev[wallUnderPointer.wallType] || {};
          const isSameVertices = JSON.stringify(prevData.vertices) === JSON.stringify(vertices);
          const isSameImage = prevData.imageUrl === (latestImageUrl.current || '');

          if (isSameVertices && isSameImage) {
            // 변경 없음 -> 상태 변경 안 함
            return prev;
          }

          return {
            ...prev,
            [wallUnderPointer.wallType]: {
              vertices,
              imageUrl: latestImageUrl.current || prevData.imageUrl || '',
            },
          };
        });

        console.log('[mouse:move] 새로운 벽 호버됨:', wallUnderPointer.wallType);
        console.log('[mouse:move] 꼭짓점 좌표:', vertices);
      } else {
      hoveredWallLocal.current = null;
      setHoveredWall(null);
      setHoveredWallVertices([]);
      setPreviewPerspective({});
      console.log('[mouse:move] 벽에서 벗어남');
      }
  };
    canvas.on('object:moving', onObjectMoving);
    canvas.on('mouse:up', onMouseUp);
    canvas.on('mouse:move', onMouseMove);

    return () => {
      canvas.off('object:moving', onObjectMoving);
      canvas.off('mouse:up', onMouseUp);
      canvas.off('mouse:move', onMouseMove);
      console.log('[useWallHoverHandler] 이벤트 제거 완료');
    };
  }, [canvasInstance, edgeFrameState, selectedTool,]);

  return { previewPerspective };  // 미리보기 데이터 반환
}
