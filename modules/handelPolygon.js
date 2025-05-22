import * as fabric from 'fabric';

const controlStyle = {
    transparentCorners: false,
    borderColor: '#A9DB78',
    editingBorderColor: '#A9DB78',
    selectionColor: 'rgba(128, 128, 128, 0.3)',
    cornerStrokeColor: '#A9DB78',
    cornerColor: 'white',
    cornerStyle: 'circle',
    borderScaleFactor: 2,
    strokeWidth: 2,
    selectable: false,
    hoverCursor: 'default',
};

function createRoomFrame( angle, fpl, fpt, fsw, fsh, fewt, fewl, fewr, fewb ) {
    // 최대 길이
    const frameMaxWidth = 1098;
    const frameMaxHeight = 648;
    
    // 앞면 위치
    const frontPosition = {
        left: fpl || 220,
        top: fpt || 120
    }
    // 앞면 크기
    const frontSize = {
        width: fsw ? (fsw || 50) : frontPosition.left + 440,
        height: fsh ? (fsh || 50) : frontPosition.top + 300
    }

    // 방 프레임 가중치?
    const frameEdgeWeight = {
        top: fewt,
        left: fewl,
        right: fewr,
        bottom: fewb
    };
    // 외곽 모서리
    const frameEdge = (fpl == undefined && fpt == undefined && fsw == undefined && fsh == undefined && fewt == undefined && fewl == undefined && fewr == undefined && fewb == undefined) ? [
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
    
    // 사각형
    // 앞면
    const front = new fabric.Rect({
        ...controlStyle,
        ...frontPosition,
        ...frontSize,
        fill: 'rgba(0, 0, 0, 0)',
        name: "SherLockRoomFrame",
        wallType: 'front',
    });


    // 여기서부터 사변형(perspective)
    // ↖↗↘↙ 순으로 도형을 그리게 해놨다

    // 천장면
    const top = new fabric.Polygon([
        frameEdge[0],
        frameEdge[1],
        { x: front.left + front.width, y: front.top },
        { x: front.left, y: front.top },
    ], {
        ...controlStyle,
        fill: 'rgba(255, 0, 255, 0.2)',
        stroke: 'purple',
        name: "SherLockRoomFrame",
        wallType: 'top',
    });
    
    // 왼쪽 벽면
    const left = new fabric.Polygon([
        frameEdge[0],
        { x: front.left, y: front.top },
        { x: front.left, y: front.top + front.height },
        frameEdge[3],
    ], {
        ...controlStyle,
        fill: 'rgba(0, 0, 255, 0.2)',
        stroke: 'blue',
        name: "SherLockRoomFrame",
        wallType: 'left',
    });
    
    // 오른쪽 벽면
    const right = new fabric.Polygon([
        { x: front.left + front.width, y: front.top },
        frameEdge[1],
        frameEdge[2],
        { x: front.left + front.width, y: front.top + front.height },
    ], {
        ...controlStyle,
        fill: 'rgba(0, 255, 0, 0.2)',
        stroke: 'green',
        name: "SherLockRoomFrame",
        wallType: 'right',
    });
    
    // 바닥면
    const bottom = new fabric.Polygon([
        { x: front.left, y: front.top + front.height },
        { x: front.left + front.width, y: front.top + front.height },
        frameEdge[2],
        frameEdge[3],
    ], {
        ...controlStyle,
        fill: 'rgba(255, 255, 0, 0.2)',
        stroke: 'orange',
        name: "SherLockRoomFrame",
        wallType: 'bottom',
    });

    // 그룹화
    const group = new fabric.Group([front, top, left, right, bottom], {
        ...controlStyle,
        name: "SherLockRoomFrame",
        wallType: "frame"  // 혹은 적절한 타입
    })

    return group;
}

export { createRoomFrame }