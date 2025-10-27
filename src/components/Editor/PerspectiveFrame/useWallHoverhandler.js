import { useEffect, useState, useRef } from 'react';
import * as fabric from 'fabric';
import {  getWallsFromCanvas, getWallVertices, restoreWallStyle, getRectVertices,
          updatePerspective, restoreWallVisualStyle, restoreImageToPointer } from './perspectiveBackground';
import { createRoomFrame } from '../../../../modules/handlePolygon';

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
  currentRoom, currentSide, // 이미지를 삽입한 방과 사이드 정보를 받아오기
  currentSideRef, currentRoomRef, // 최신값 반영
  setIsPerspectiveUpdated // 캡쳐 이벤트
}) {

  const [previewPerspective, setPreviewPerspective] = useState({}); // 임시 미리보기용
  const preHoveredWall = useRef(null); // 이전 호버한 벽 정보
  const latestImageUrl = useRef(''); // 드래그 중인 이미지 URL
  const latestImageName = useRef(''); // 드래그 중인 이미지 파일명
  const draggingImage = useRef(null); // 현재 드래그 중인 이미지 객체

  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas || selectedTool !== 'frame') return;

    // ----------------------------
    // 1️⃣ 이미지 객체 이동 이벤트
    // ----------------------------
    const onObjectMoving = (e) => {
      const movingObj = e.target;
      if (!movingObj) return;

      if (movingObj.type === 'image') {
        isDragging.current = true;
        draggingImage.current = movingObj; // 드래그 중인 이미지 객체 저장
        latestImageUrl.current = movingObj.getSrc ? movingObj.getSrc() : movingObj.imageUrl;
        latestImageName.current = movingObj.imgName || '';

        // 이미 확정된 벽이면 이미지 변경 막기
        const currentWall = hoveredWallLocal.current;
        if (currentWall && perspective[currentWall.wallType]?.imageUrl) return;
      } else {
        isDragging.current = false;
        draggingImage.current = null;
        latestImageUrl.current = '';
      }
    };

    // ----------------------------
    // 2️⃣ 마우스 업 이벤트 (드래그 종료)
    // ----------------------------
    const onMouseUp = () => {
      isDragging.current = false;

      // 이전 호버 스타일 복원
      restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);

      const room = currentRoomRef.current;
      const side = currentSideRef.current;

      if (!hoveredWallLocal.current) return;

      const wall = hoveredWallLocal.current;
      const vertices = getWallVertices(wall);

      // 이미 확정된 이미지가 있으면 변경하지 않음
      if (perspectiveRef.current?.[room]?.[side]?.[wall.wallType]?.imageUrl) {
        setPreviewPerspective({});
        hoveredWallLocal.current = null;
        setHoveredWall(null);
        setHoveredWallVertices([]);
        return;
      }

      // ----------------------------
      // 2-1️⃣ Perspective 상태에 이미지 확정 저장
      // ----------------------------
      setPerspective(prev => {
        const newPersp = { ...prev };
        newPersp[room] ??= {};
        newPersp[room][side] ??= {};
        newPersp[room][side][wall.wallType] = {
          vertices,
          imageUrl: latestImageUrl.current || '',
          imgName: latestImageName.current || '',
          currentRoom: room,
          currentSide: side,
        };
        return newPersp;
      });

      // ----------------------------
      // 2-2️⃣ 이미지 객체 상태 업데이트 (선택 불가, 이벤트 비활성화, 투명화)
      // ----------------------------
      if (draggingImage.current) {
        draggingImage.current.set({
          selectable: false,
          evented: false,
          opacity: 0,
          visible: false,
          inputWall: wall.wallType,
          currentRoom: room,
          currentSide: side,
        });
      }

      // ----------------------------
      // 2-3️⃣ 벽 객체 투명화
      // ----------------------------
      if (latestImageUrl.current) {
        wall.set({
          fill: 'rgba(0,0,0,0)',
          stroke: null,
          selectable: false,
          evented: false,
        });

        if (wall.wallType === 'front') {
          const controllerObj = canvas.getObjects().find(obj => obj.name === 'SherLockRoomController');
          if (controllerObj) {
            controllerObj.set({ fill: 'rgba(0,0,0,0)', stroke: 'rgba(0,0,0,0)' });
          }
        }

        canvas.discardActiveObject(); // 선택박스 비가시화
        canvas.renderAll();
        setIsPerspectiveUpdated(true);
      }

      setPreviewPerspective({});
      hoveredWallLocal.current = null;
      setHoveredWall(null);
      setHoveredWallVertices([]);
    };

    // ----------------------------
    // 3️⃣ 마우스 무브 이벤트 (hover)
    // ----------------------------
    const onMouseMove = (opt) => {
      if (!isDragging.current) return;

      const pointer = opt.absolutePointer || canvas.getPointer(opt.e);
      const currentWalls = getWallsFromCanvas(canvas);
      const wallUnderPointer = currentWalls.find(wall => wall.containsPoint(pointer));

      if (wallUnderPointer === hoveredWallLocal.current) return;

      // 이전 호버 스타일 복원
      restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);

      // 이전 호버의 preview 초기화
      const prevWallType = preHoveredWall.current?.wallType;
      if (prevWallType) {
        const room = currentRoomRef.current;
        const side = currentSideRef.current;
        setPreviewPerspective(prev => ({
          ...prev,
          [room]: {
            ...(prev[room] || {}),
            [side]: {
              ...((prev[room] && prev[room][side]) || {}),
              [prevWallType]: { vertices: [], imageUrl: '', imgName: '' },
            },
          },
        }));
      }

      if (!wallUnderPointer) {
        hoveredWallLocal.current = null;
        setHoveredWall(null);
        setHoveredWallVertices([]);
        setPreviewPerspective({});
        return;
      }

      // 새로운 벽 hover 처리
      hoveredWallLocal.current = wallUnderPointer;
      preHoveredWall.current = wallUnderPointer;

      if (!originalStyles.current.has(wallUnderPointer)) {
        originalStyles.current.set(wallUnderPointer, {
          fill: wallUnderPointer.fill,
          stroke: wallUnderPointer.stroke,
        });
      }

      wallUnderPointer.set({ fill: 'rgba(180,180,180,0.7)', stroke: '#555' });
      const vertices = getWallVertices(wallUnderPointer);
      setHoveredWall(wallUnderPointer);
      setHoveredWallVertices(vertices);
      canvas.renderAll();

      // previewPerspective 업데이트
      const room = currentRoomRef.current;
      const side = currentSideRef.current;

      setPreviewPerspective(prev => {
        const prevData = prev?.[room]?.[side]?.[wallUnderPointer.wallType] || {};
        const isSameVertices = JSON.stringify(prevData.vertices) === JSON.stringify(vertices);
        const isSameImage = prevData.imageUrl === (latestImageUrl.current || '');
        if (isSameVertices && isSameImage) return prev;

        const newPreview = { ...prev };
        newPreview[room] ??= {};
        newPreview[room][side] ??= {};
        newPreview[room][side][wallUnderPointer.wallType] = {
          vertices,
          imageUrl: latestImageUrl.current || prevData.imageUrl || '',
        };
        return newPreview;
      });
    };

    // ----------------------------
    // 4️⃣ 마우스 더블클릭 이벤트 (이미지 제거)
    // ----------------------------
    const onMouseDblClick = (opt) => {
      const pointer = opt.absolutePointer || canvas.getPointer(opt.e);
      const wall = getWallsFromCanvas(canvas).find(w => w.containsPoint(pointer));
      if (!wall) return;

      const wallType = wall.wallType;
      const room = currentRoomRef.current;
      const side = currentSideRef.current;

      const currentData = perspectiveRef.current?.[room]?.[side]?.[wallType];
      if (!currentData?.imageUrl) return;

      // Perspective 상태에서 이미지 제거
      setPerspective(prev => {
        const newPersp = { ...prev };
        newPersp[room] ??= {};
        newPersp[room][side] ??= {};
        newPersp[room][side][wallType] = { vertices: [], imageUrl: '', imgName: '' };
        return newPersp;
      });

      // Canvas 이미지 복원
      restoreImageToPointer(canvas, pointer, wallType, room, side);

      // 벽 스타일 복원
      restoreWallVisualStyle(wall, wallType, canvas);

      setIsPerspectiveUpdated(true);
    };

    // ----------------------------
    // 5️⃣ 이벤트 바인딩
    // ----------------------------
    canvas.on('object:moving', onObjectMoving);
    canvas.on('mouse:up', onMouseUp);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:dblclick', onMouseDblClick);

    return () => {
      canvas.off('object:moving', onObjectMoving);
      canvas.off('mouse:up', onMouseUp);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:dblclick', onMouseDblClick);
    };
  }, [canvasInstance, edgeFrameState, selectedTool]);

  return { previewPerspective }; // 미리보기 데이터 반환
}
