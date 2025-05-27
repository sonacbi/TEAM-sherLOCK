import * as fabric from 'fabric';


// 📝 벽 객체의 4개 꼭지점 좌표를 canvas 좌표계 기준으로 계산하는 함수
export function getWallVertices(wall) {
    if (!wall || !wall.get('points')) return [];

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

// 📝 사각형(rect) 객체의 4개 꼭지점 좌표를 계산하는 함수
export function getRectVertices(rect) {
    const left = rect.left;
    const top = rect.top;
    const width = rect.width * rect.scaleX;   // 스케일 적용된 실제 너비
    const height = rect.height * rect.scaleY; // 스케일 적용된 실제 높이

// 좌상단, 우상단, 우하단, 좌하단 꼭지점 배열 리턴
    return [
        new fabric.Point(left, top),
        new fabric.Point(left + width, top),
        new fabric.Point(left + width, top + height),
        new fabric.Point(left, top + height),
    ];
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