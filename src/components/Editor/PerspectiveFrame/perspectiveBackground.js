import * as fabric from 'fabric';


// 📝 벽 객체의 4개 꼭지점 좌표를 canvas 좌표계 기준으로 계산하는 함수
export function getWallVertices(wall) {
    // if (!wall || !wall.get('points')) return [];
    if (!wall) return [];
    if (wall.type === 'rect') {
        return getRectVertices(wall);
    }
    // polygon 타입인 경우 (기존 방식)
    if (wall.get('points')) {
        const points = wall.get('points'); // polygon의 로컬 좌표 (path 좌표)
        const matrix = wall.calcTransformMatrix(); // 벽 객체의 전체 변환 행렬 (이동, 회전, 스케일 포함)

        // polygon의 기준점인 pathOffset (left/top 기준 보정값)
        const offsetX = wall.pathOffset?.x || 0;
        const offsetY = wall.pathOffset?.y || 0;

        // 각 로컬 좌표에서 pathOffset 보정 후, 전체 변환 행렬을 적용하여 캔버스 좌표계로 변환
        return points.map(p => {
            const localPoint = new fabric.Point(p.x - offsetX, p.y - offsetY);
            const transformed = fabric.util.transformPoint(localPoint, matrix);
            return transformed;
        });
    }
}

// 📝 사각형(rect) 객체의 4개 꼭지점 좌표를 계산하는 함수
export function getRectVertices(rect) {
    // 도형의 로컬 꼭짓점 좌표 (origin 기준)
    const strokeWidth = rect.strokeWidth || 0;
    const halfStroke = strokeWidth / 2;

    const points = [
        new fabric.Point(-rect.width / 2 - halfStroke, -rect.height / 2 - halfStroke),
        new fabric.Point(rect.width / 2 + halfStroke, -rect.height / 2 - halfStroke),
        new fabric.Point(rect.width / 2 + halfStroke, rect.height / 2 + halfStroke),
        new fabric.Point(-rect.width / 2 - halfStroke, rect.height / 2 + halfStroke),
    ];

    const matrix = rect.calcTransformMatrix();

    return points.map(p => fabric.util.transformPoint(p, matrix));
}

// 📝 꼭지점에 오프셋(이동)과 회전을 적용하는 함수
export function applyOffsetToVertices(vertices, wall) {
    if (!vertices || vertices.length === 0) return [];

    const offsetX = wall.left || 0;    // 벽 객체의 캔버스 좌표 X
    const offsetY = wall.top || 0;     // 벽 객체의 캔버스 좌표 Y
    const angle = wall.angle || 0;     // 벽 객체의 회전 각도 (도 단위)

    // 점 하나를 주어진 각도만큼 회전시키는 내부 함수 (rad 단위)
    function rotatePoint(point, angleRad) {
        const cos = Math.cos(angleRad);
        const sin = Math.sin(angleRad);
        return new fabric.Point(
            point.x * cos - point.y * sin,
            point.x * sin + point.y * cos
        );
    }

    const angleRad = fabric.util.degreesToRadians(angle);

    // 각 꼭지점에 대해 회전 후, offset(이동) 적용하여 캔버스 좌표계로 변환
    return vertices.map(pt => {
        const rotated = rotatePoint(pt, angleRad);
        return new fabric.Point(rotated.x + offsetX, rotated.y + offsetY);
    });
}

// 📝 캔버스에서 벽 객체들만 추출하는 함수
export function getWallsFromCanvas(canvas) {
    if (!canvas) return [];

    const objects = canvas.getObjects();
    let walls = [];

    // console.log('캔버스 전체 객체 개수:', objects.length);

    objects.forEach((obj, idx) => {
        // console.log(`객체[${idx}]: type=${obj.type}, name=${obj.name}, wallType=${obj.get('wallType')}`);

        // 그룹 객체인 경우, 그룹 내부 객체 중 벽 유형에 해당하는 객체만 필터링
        if (obj.type === 'group') {
            const groupWalls = obj._objects.filter(o =>
                ['front', 'bottom', 'left', 'right', 'top'].includes(o.get('wallType'))
            );
            // console.log(`  그룹 내부 벽 객체 개수: ${groupWalls.length}`);

            groupWalls.forEach((w, i) => {
                // console.log(`    벽[${i}]: type=${w.type}, wallType=${w.get('wallType')}`);
            });

            walls = walls.concat(groupWalls);
        } else {
            // 그룹이 아닌 단일 객체 중 벽 유형에 해당하는 경우 바로 추가
            if (['front', 'bottom', 'left', 'right', 'top'].includes(obj.get('wallType'))) {
                // console.log(`  그룹 밖 벽 객체 발견: wallType=${obj.get('wallType')}`);
                walls.push(obj);
            }
        }
    });

    // console.log('최종 벽 객체 개수:', walls.length);
    walls.forEach((w, i) => {
        // console.log(`벽[${i}]: type=${w.type}, wallType=${w.get('wallType')}`);
    });
    // console.log(walls.map(w => w.type))
    return walls;
}

// 호버 상태가 끝났을 때 원래 스타일로 복원하는 함수
export function restoreWallStyle(hoveredWallLocal, originalStyles, canvasInstance) {
    if (!hoveredWallLocal.current) return;
    const original = originalStyles.current.get(hoveredWallLocal.current);
    if (original) {
        hoveredWallLocal.current.set({
            fill: original.fill,
            stroke: original.stroke,
        });
        originalStyles.current.delete(hoveredWallLocal.current);
        canvasInstance.current.renderAll();
    }
}


// 공통 틀 예시 (actionType: 'save' | 'remove')
export const updatePerspective = (actionType, wall, pointer) => {
    const wallType = wall.wallType;
    const room = currentRoomRef.current;
    const side = currentSideRef.current;

    // 1. perspective 상태 업데이트
    setPerspective(prev => {
        const next = { ...prev };
        next[room] = next[room] || {};
        next[room][side] = next[room][side] || {};

        if (actionType === 'save') {
        // 저장: 벽 정점과 이미지 URL 저장
        next[room][side][wallType] = {
            vertices: getWallVertices(wall),
            imageUrl: latestImageUrl.current || '',
            currentRoom: room,
            currentSide: side,
        };
        } else {
        // 제거: 정점과 이미지 URL 제거
        next[room][side][wallType] = {
            ...next[room][side][wallType],
            vertices: [],
            imageUrl: '',
        };
        }

        return next;
    });

    // 2. 이미지 객체 처리
    const imageObj = canvas.getObjects().find(
        obj => obj.type === 'image' && obj.inputWall === wallType
    );

    if (imageObj) {
        if (actionType === 'save') {
        // 저장 시: 이미지 비활성화 및 숨김 처리
        imageObj.set({
            selectable: false,
            evented: false,
            opacity: 0,
            visible: false,
            inputWall: wallType,
        });
        } else if (pointer) {
        // 제거 시: 이미지 재배치 및 활성화
        const scaledWidth = imageObj.width * imageObj.scaleX;
        const scaledHeight = imageObj.height * imageObj.scaleY;

        imageObj.set({
            left: pointer.x - scaledWidth / 2,
            top: pointer.y - scaledHeight / 2,
            selectable: true,
            evented: true,
            opacity: 1,
            visible: true,
            inputWall: '',
        });

        imageObj.setCoords(); // 위치 재계산
        canvas.setActiveObject(imageObj); // 포커스 설정
        }
    }

    // 3. 벽 스타일 설정
    if (actionType === 'save') {
        wall.set({
        fill: 'rgba(0,0,0,0)',
        stroke: null,
        selectable: false,
        evented: false,
        });
    } else {
        const restore = wallStyles[wallType] || {};
        wall.set({
        ...restore,
        selectable: true,
        evented: true,
        });
    }

    // 4. front 벽일 경우 컨트롤러 스타일도 변경
    if (wallType === 'front') {
        const controllerObj = canvas.getObjects().find(
        obj => obj.name === 'SherLockRoomController'
        );

        if (controllerObj) {
        controllerObj.set(
            actionType === 'save'
            ? { fill: 'rgba(0,0,0,0)', stroke: 'rgba(0,0,0,0)' }
            : { fill: 'rgba(255,0,0,0.2)', stroke: 'red' }
        );
        }
    }

    // 5. 캔버스 상태 정리
    canvas.discardActiveObject(); // 선택 해제
    canvas.renderAll(); // 다시 그리기
};


// 벽 스타일 복원
export const restoreWallVisualStyle = (wall, wallType, canvas) => {
    const wallStyles = {
        top:    { fill: 'rgba(255, 0, 255, 0.2)', stroke: 'purple' },
        left:   { fill: 'rgba(0, 0, 255, 0.2)', stroke: 'blue' },
        right:  { fill: 'rgba(0, 255, 0, 0.2)', stroke: 'green' },
        bottom: { fill: 'rgba(255, 255, 0, 0.2)', stroke: 'orange' },
        front:  { fill: 'rgba(0, 0, 0, 0)', stroke: undefined },
    };

    const style = wallStyles[wallType] || {};
    wall.set({ ...style, selectable: true, evented: true });

    if (wallType === 'front') {
        const controller = canvas.getObjects().find(obj => obj.name === 'SherLockRoomController');
        if (controller) {
        controller.set({
            fill: 'rgba(255, 0, 0, 0.2)',
            stroke: 'red',
        });
        }
    }
};

// 이미지 제거 및 복원 (room/side/wallType 기준)
export const restoreImageToPointer = (canvas, pointer, wallType, room, side) => {
    if (!canvas) return;

    const roomVal = room?.current ?? room;
    const sideVal = side?.current ?? side;

    // 1️⃣ 정확 일치 우선 검색
    let imageObj = canvas.getObjects().find(obj => {
        if (obj.type !== 'image') return false;
        const objRoom = obj.currentRoom?.current ?? obj.currentRoom;
        const objSide = obj.currentSide?.current ?? obj.currentSide;
        return (
            String(obj.inputWall) === String(wallType) &&
            String(objRoom) === String(roomVal) &&
            String(objSide) === String(sideVal)
        );
    });

    // 2️⃣ room/side 없는 fallback
    if (!imageObj) {
        imageObj = canvas.getObjects().find(obj => {
            if (obj.type !== 'image') return false;
            const objRoom = obj.currentRoom?.current ?? obj.currentRoom;
            const objSide = obj.currentSide?.current ?? obj.currentSide;
            return (
                String(obj.inputWall) === String(wallType) &&
                (!objRoom || !objSide)
            );
        });
    }

    // 3️⃣ wallType만 맞는 fallback
    if (!imageObj) {
        imageObj = canvas.getObjects().find(
            obj => obj.type === 'image' && String(obj.inputWall) === String(wallType)
        );
    }

    if (!imageObj) {
        console.warn('[RESTORE] No image object found to restore for wallType:', wallType);
        return;
    }

    // 🔹 성능 최적화를 위한 사전 계산
    const scaleX = imageObj.scaleX || 1;
    const scaleY = imageObj.scaleY || 1;
    const scaledWidth = imageObj.width * scaleX;
    const scaledHeight = imageObj.height * scaleY;
    const left = pointer.x - scaledWidth / 2;
    const top = pointer.y - scaledHeight / 2;

    // 🔹 속성 한번에 적용 (set → renderAll 사이 딜레이 제거)
    imageObj.set({
        left,
        top,
        selectable: true,
        evented: true,
        opacity: 1,
        visible: true,
        inputWall: '', // 초기화
    });

    // 🔹 setCoords 생략 시 일부 좌표 반영 안 되므로 즉시 호출
    imageObj.setCoords();

    // 🔹 기존 렌더 큐 대기 없이 바로 렌더링 (속도 향상)
    canvas.requestRenderAll(); // renderAll보다 프레임 지연 적음

    // 🔹 선택 처리도 비동기 큐로 (프레임 블로킹 방지)
    requestAnimationFrame(() => {
        canvas.discardActiveObject();
        canvas.setActiveObject(imageObj);
        canvas.renderAll(); // 보장용
    });
};
