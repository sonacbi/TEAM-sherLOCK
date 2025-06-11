import { useEffect, useState, useRef } from 'react';
import * as fabric from 'fabric';
import { getWallsFromCanvas, getWallVertices, restoreWallStyle, getRectVertices } from './perspectiveBackground';
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
    currentSideRef, currentRoomRef // 최신값 반영
}) {

  const [previewPerspective, setPreviewPerspective] = useState({}); // 임시 미리보기용
  // 이전 호버한 벽 정보
  const preHoveredWall = useRef(null);
  const latestImageUrl = useRef('');

  const draggingImage = useRef(null);

  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas || selectedTool !== 'frame') return;

    const onObjectMoving = (e) => {
        const movingObj = e.target;
        if (!movingObj) return;

        // 이미지 객체인지 확인 (예: movingObj.type === 'image')
        if (movingObj.type === 'image') {
          isDragging.current = true;
          draggingImage.current = movingObj;  // 드래그 중인 이미지 객체
          // console.log('[object:moving] 이미지 드래그 시작');
          
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
          draggingImage.current = null;  // 드래그 대상 없을 때는 초기화
          latestImageUrl.current = '';
        }
    };

    const onMouseUp = () => {
      isDragging.current = false;
      // console.log('[mouse:up] 드래그 종료');
      restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);
      
      // currentRoom, currentSide 대신 ref를 써서 최신값 보장
      const room = currentRoomRef.current;
      const side = currentSideRef.current;

      if (hoveredWallLocal.current) {
        const wall = hoveredWallLocal.current;
        const vertices = getWallVertices(wall);

        // 확정된 이미지가 있으면 변경 안 함
        if (
          perspectiveRef.current?.[room]?.[side]?.[wall.wallType]?.imageUrl
        ) {
          console.log(`[mouse:up] 이미지가 이미 확정되어 변경하지 않음: ${wall.wallType}`);
          setPreviewPerspective({});
          hoveredWallLocal.current = null;
          setHoveredWall(null);
          setHoveredWallVertices([]);
          return;
        }

        // prev가 최신 상태

        // ✅ 여기서 드래그한 벽과 이미지 URL을 perspective에 저장
        setPerspective(prev => {
        const newPerspective = { ...prev };

        // 중첩 구조가 없다면 초기화
        if (!newPerspective[room]) newPerspective[room] = {};
        if (!newPerspective[room][side]) newPerspective[room][side] = {};

        newPerspective[room][side][wall.wallType] = {
          vertices: vertices,
          imageUrl: latestImageUrl.current || '',
          currentRoom: room,
          currentSide: side,
        };

        return newPerspective;
      });

        // 이미지 확정 처리: 이미지 위치 고정, 선택 불가, 이벤트 비활성, 투명화, 선택박스 비가시화
        if (draggingImage.current) {
          draggingImage.current.set({ selectable: false, evented: false, opacity: 0, visible: false, inputWall: wall.wallType,});
        }
        
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

        canvas.discardActiveObject(); // 확실하게 이미지 선택박스 비가시화
        canvas.renderAll();

        // console.log(`[mouse:up] ${wall.wallType} 벽을 이미지 확정으로 투명하게 설정`);
      }
        setPreviewPerspective({});  // 미리보기 초기화
        // console.log(`[mouse:up] perspective 저장됨: ${wall.wallType}`, vertices, latestImageUrl.current);
      }
      
      // 호버 플래그 초기화
      hoveredWallLocal.current = null;
      setHoveredWall(null);
      setHoveredWallVertices([]);
    };

    const onMouseMove = opt => {
      if (!isDragging.current) return;

      const pointer = opt.absolutePointer || canvas.getPointer(opt.e);
      const currentWalls = getWallsFromCanvas(canvas);
      const wallUnderPointer = currentWalls.find(wall => wall.containsPoint(pointer));

      // console.log('[mouse:move] 포인터 위치:', pointer);
      // console.log('[mouse:move] 감지된 벽:', wallUnderPointer?.wallType || '없음');

      if (wallUnderPointer === hoveredWallLocal.current) {
        // console.log('[mouse:move] 동일한 벽이므로 무시');
        return;
      }

      // 이전 벽 스타일 복원
      restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance);
      // console.log('[mouse:move] 이전 벽 스타일 복원 완료');

        // // 이전 벽의 perspective 정보 초기화
        const prevWallType = preHoveredWall.current?.wallType;
          if (prevWallType) {
            setPreviewPerspective(prev => {
              if (!prevWallType) return prev;
              return {
                ...prev,
                [currentRoom]: {
                  ...(prev[currentRoom] || {}),
                  [currentSide]: {
                    ...((prev[currentRoom] && prev[currentRoom][currentSide]) || {}),
                    [prevWallType]: { vertices: [], imageUrl: '' }
                  }
                }
              };
            });
          }

      if (wallUnderPointer) {
        hoveredWallLocal.current = wallUnderPointer;
        preHoveredWall.current = wallUnderPointer;  // 업데이트

        if (!originalStyles.current.has(wallUnderPointer)) {
          originalStyles.current.set(wallUnderPointer, {
            fill: wallUnderPointer.fill,
            stroke: wallUnderPointer.stroke,
          });
          // console.log('[mouse:move] 원래 스타일 저장');
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
          const prevData = prev?.[currentRoom]?.[currentSide]?.[wallUnderPointer.wallType] || {};
          const isSameVertices = JSON.stringify(prevData.vertices) === JSON.stringify(vertices);
          const isSameImage = prevData.imageUrl === (latestImageUrl.current || '');

          if (isSameVertices && isSameImage) return prev;

          const newPreview = { ...prev };
          newPreview[currentRoom] ??= {};
          newPreview[currentRoom][currentSide] ??= {};
          newPreview[currentRoom][currentSide][wallUnderPointer.wallType] = {
            vertices,
            imageUrl: latestImageUrl.current || prevData.imageUrl || ''
          };

          return newPreview;
        });



        // console.log('[mouse:move] 새로운 벽 호버됨:', wallUnderPointer.wallType);
        // console.log('[mouse:move] 꼭짓점 좌표:', vertices);
      } else {
      hoveredWallLocal.current = null;
      setHoveredWall(null);
      setHoveredWallVertices([]);
      setPreviewPerspective({});
      // console.log('[mouse:move] 벽에서 벗어남');
      }
  };

  const onMouseDblClick = (opt) => {
    const canvas = canvasInstance.current;
    const pointer = opt.absolutePointer || canvas.getPointer(opt.e);
    const currentWalls = getWallsFromCanvas(canvas);
    const wallUnderPointer = currentWalls.find(wall => wall.containsPoint(pointer));

    if (!wallUnderPointer) return;

    const wallType = wallUnderPointer.wallType;
    const currentData = perspectiveRef.current?.[currentRoom]?.[currentSide]?.[wallType];
    if (!currentData || !currentData.imageUrl) return;

    const wallStyles = {
      top:    { fill: 'rgba(255, 0, 255, 0.2)', stroke: 'purple' },
      left:   { fill: 'rgba(0, 0, 255, 0.2)', stroke: 'blue' },
      right:  { fill: 'rgba(0, 255, 0, 0.2)', stroke: 'green' },
      bottom: { fill: 'rgba(255, 255, 0, 0.2)', stroke: 'orange' },
      front:  { fill: 'rgba(0, 0, 0, 0)', stroke: undefined },
    };

    // console.log(`[dblclick] ${wallType} 벽에서 이미지 제거`);

      // perspective에서 이미지 및 꼭지점 제거
      setPerspective(prev => {
      const newPerspective = { ...prev };
      if (newPerspective[currentRoom]?.[currentSide]?.[wallType]) {
        newPerspective[currentRoom][currentSide][wallType] = {
          ...newPerspective[currentRoom][currentSide][wallType],
          imageUrl: '',
          vertices: [],
        };
      }
      return newPerspective;
    });

      // 캔버스 오브젝트 중에서 해당 이미지 URL 가진 객체 찾기
      const imageObj = canvas.getObjects().find(obj => obj.type === 'image' && obj.inputWall === wallType);
      if (imageObj) {
        const scaledWidth = imageObj.width * imageObj.scaleX;
        const scaledHeight = imageObj.height * imageObj.scaleY;

        imageObj.set({
          left: pointer.x - scaledWidth / 2,
          top: pointer.y - scaledHeight / 2,
          selectable: true,
          evented: true,
          opacity: 1,
          visible: true,
          inputWall: '', // 초기화
        });

        imageObj.setCoords(); // 경계 다시 계산
        canvas.discardActiveObject();
        canvas.setActiveObject(imageObj);
      }


      // 벽 스타일 복원
      const style = wallStyles[wallType] || {};
      wallUnderPointer.set({
        ...style,
        selectable: true,
        evented: true,
      });

      // front 벽일 때 컨트롤러도 함께 복원
      if (wallType === 'front') {
        const controllerName = 'SherLockRoomController';
        const controllerStyle = {
          fill: 'rgba(255, 0, 0, 0.2)',
          stroke: 'red',
        };

        const controllerObj = canvas.getObjects().find(obj => obj.name === controllerName);
        if (controllerObj) {
          controllerObj.set(controllerStyle);
        }
      }
      imageObj.setCoords(); // 경계 다시 계산
      
      canvas.discardActiveObject(); // 튀어나온 이미지 선택 가능하게
      canvas.setActiveObject(imageObj);        // 이미지 선택 박스 씌우기
      canvas.renderAll();
      // console.log(`[dblclick] ${wallType} 벽 이미지 제거 및 스타일 복원 완료`);
  };


    canvas.on('object:moving', onObjectMoving);
    canvas.on('mouse:up', onMouseUp);
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:dblclick', onMouseDblClick);

    return () => {
      canvas.off('object:moving', onObjectMoving);
      canvas.off('mouse:up', onMouseUp);
      canvas.off('mouse:move', onMouseMove);
      canvas.off('mouse:dblclick', onMouseDblClick);
      // console.log('[useWallHoverHandler] 이벤트 제거 완료');
    };
  }, [canvasInstance, edgeFrameState, selectedTool,]);

  return { previewPerspective };  // 미리보기 데이터 반환
}
