import { useEffect, useState } from 'react';
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
    position, size, edgeFrameState, angle,
    selectedTool,
    setPerspective,
    
}) {
    // 내부 상태로 imageUrl 관리
  const [imageUrl, setImageUrl] = useState('');
  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas || selectedTool !== 'frame') return;

    // 마운트 시 벽 리스트 저장
    const walls = getWallsFromCanvas(canvas);
    setWalls(walls);
    console.log('[useWallHoverHandler] 초기 벽 리스트 저장:', walls);

    const onObjectMoving = (e) => {
        isDragging.current = true;
        const movingObj = e.target;
        if (!movingObj) return;
        console.log('[object:moving] 드래그 시작');

        setImageUrl(movingObj.imageUrl);
    };

    const onMouseUp = () => {
      isDragging.current = false;
      console.log('[mouse:up] 드래그 종료');
      restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);

      
      if (hoveredWallLocal.current) {
        const wall = hoveredWallLocal.current;
        const vertices = getWallVertices(wall);

        // ✅ 여기서 드래그한 벽과 이미지 URL을 perspective에 저장
        setPerspective(prev => ({
          ...prev,
          [wall.wallType]: {
            ...prev[wall.wallType],
            vertices: vertices,
            imageUrl: imageUrl || prev[wall.wallType]?.imageUrl || ''
          }
        }));

        console.log(`[mouse:up] perspective 저장됨: ${wall.wallType}`, vertices, imageUrl);
      }
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

      if (wallUnderPointer) {
        hoveredWallLocal.current = wallUnderPointer;

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

        console.log('[mouse:move] 새로운 벽 호버됨:', wallUnderPointer.wallType);
        console.log('[mouse:move] 꼭짓점 좌표:', vertices);
      } else {
        hoveredWallLocal.current = null;
        setHoveredWall(null);
        setHoveredWallVertices([]);
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
  }, [canvasInstance, selectedTool, imageUrl]);
}
