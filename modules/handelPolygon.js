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
    };

function createRoomFrame( fpl, fpt, fsw, fsh, fewt, fewl, fewr, fewb ) {
    const frameFullWidth = 1098;
    const frameFullHeight = 648;
    
    const frontPosition = {
        left: fpl,
        top: fpt
    }
    const frontSize = {
        width: frontPosition.left + (fsw),
        height: frontPosition.top + (fsh)
    }

    const frameEdgeWeight = {
        top: fewt,
        left: fewl,
        right: fewr,
        bottom: fewb
    };
    console.log(frontPosition)
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
    // const frameEdge = [
    //     { x: frontPosition.left - frameEdgeWeight.left,                     y: frontPosition.top - frameEdgeWeight.top },
    //     { x: frontPosition.left + frontSize.width + frameEdgeWeight.right,  y: frontPosition.top - frameEdgeWeight.top },
    //     { x: frontPosition.left + frontSize.width + frameEdgeWeight.right,  y: frontPosition.top + frontSize.height + frameEdgeWeight.bottom },
    //     { x: frontPosition.left - frameEdgeWeight.left,                     y: frontPosition.top + frontSize.height + frameEdgeWeight.bottom }
    // ];
    
    const front = new fabric.Rect({
        ...controlStyle,
        ...frontPosition,
        ...frontSize,
        fill: 'rgba(255, 0, 0, 0.2)',
        stroke: 'red',
        strokeWidth: 2,
        hoverCursor: 'default',
    });

    // (사변형 - perspective)
    // 천장
    const top = new fabric.Polygon([
        frameEdge[0],     // ↖
        frameEdge[1],    // ↗
        { x: front.left + front.width, y: front.top },     // ↘
        { x: front.left, y: front.top },     // ↙
    ], {
        ...controlStyle,
        fill: 'rgba(255, 0, 255, 0.2)',
        stroke: 'purple',
        strokeWidth: 2,
        // selectable: false,
        hoverCursor: 'default',
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
        strokeWidth: 2,
        // selectable: false,
        hoverCursor: 'default',
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
        strokeWidth: 2,
        // selectable: false,
        hoverCursor: 'default',
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
        strokeWidth: 2,
        // selectable: false,
        hoverCursor: 'default',
    });

    return [front, top, left, right, bottom];
}

export { createRoomFrame }