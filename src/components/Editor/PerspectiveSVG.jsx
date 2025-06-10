// PerspectiveSVG.jsx

import React from 'react';

const vanishingPoint = { x: 0, y: 0 };
const focalLength = 112;
const scale = 0.083; // 기존보다 크게 설정하여 변환 효과 강조

const offsetX = -46.0;
const offsetY = -27.5;

export function perspectiveProjection(vertex) {
    const z = Math.max(vertex.z || 0.1, 0.1); // 최소값 설정
    
    const projectedX = (vertex.x * focalLength) / (z + focalLength);
    const projectedY = (vertex.y * focalLength) / (z + focalLength);

    const centerAdjustmentX = (projectedX - vanishingPoint.x) * scale + offsetX;
    const centerAdjustmentY = (projectedY - vanishingPoint.y) * scale + offsetY;

    return {
        x: centerAdjustmentX,
        y: centerAdjustmentY,
    };
}

export function sortVerticesClockwise(vertices) {
    return vertices.sort((a, b) => {
        return Math.atan2(a.y - b.y, a.x - b.x);
    });
}


export default function PerspectiveSVG({ perspectiveWalls, roomData, roomIndex, sideIndex }) {
    if (!roomData || !perspectiveWalls || !perspectiveWalls[roomIndex]) return null;

    const side = perspectiveWalls[roomIndex][sideIndex];
    if (!side) return null;

    const allProjectedPoints = [];

    ['bottom', 'top', 'left', 'right', 'front', 'back'].forEach(wallType => {
        const face = side[wallType];
        if (!face || !face.vertices || face.vertices.length !== 4) return;

        const projected = face.vertices.map(perspectiveProjection);
        allProjectedPoints.push(...projected);
    });

    if (allProjectedPoints.length === 0) return null;

    const svgWidth = 90;
    const svgHeight = 55;

    const xs = allProjectedPoints.map(p => p.x);
    const ys = allProjectedPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;

    const svgAspect = svgWidth / svgHeight;
    const boxAspect = width / height;

    let scale;
    if (boxAspect > svgAspect) {
        scale = svgWidth / width;
    } else {
        scale = svgHeight / height;
    }

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scaledPoints = allProjectedPoints.map(p => ({
        x: (p.x - centerX) * scale,
        y: (p.y - centerY) * scale,
    }));

    const scaledXs = scaledPoints.map(p => p.x);
    const scaledYs = scaledPoints.map(p => p.y);
    const vMinX = Math.min(...scaledXs);
    const vMaxX = Math.max(...scaledXs);
    const vMinY = Math.min(...scaledYs);
    const vMaxY = Math.max(...scaledYs);

    const viewBoxX = vMinX;
    const viewBoxY = vMinY;
    const viewBoxWidth = vMaxX - vMinX;
    const viewBoxHeight = vMaxY - vMinY;

    return (
        <svg
            width={svgWidth}
            height={svgHeight}
            viewBox={`${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{
                imageRendering: 'pixelated',
                shapeRendering: 'crispEdges',
            }}
        >
            <defs>
                {['bottom', 'top', 'left', 'right', 'front', 'back'].map(wallType => {
                    const face = side[wallType];
                    if (!face || !face.imageUrl || !face.vertices || face.vertices.length !== 4) return null;

                    const projectedVertices = face.vertices.map(perspectiveProjection);
                    const xs = projectedVertices.map(v => v.x);
                    const ys = projectedVertices.map(v => v.y);
                    const minX = Math.min(...xs);
                    const minY = Math.min(...ys);
                    const maxX = Math.max(...xs);
                    const maxY = Math.max(...ys);
                    const width = maxX - minX;
                    const height = maxY - minY;

                    return (
                        <pattern
                            id={`img-${roomIndex}-${sideIndex}-${wallType}`}
                            key={`pat-${roomIndex}-${sideIndex}-${wallType}`}
                            patternUnits="userSpaceOnUse"
                            x={minX}
                            y={minY}
                            width={width}
                            height={height}
                        >
                            <image
                                href={face.imageUrl}
                                x="0"
                                y="0"
                                width={width}
                                height={height}
                                preserveAspectRatio="none"
                            />
                        </pattern>
                    );
                })}
            </defs>

            {['bottom', 'top', 'left', 'right', 'front', 'back'].map(wallType => {
                const face = side[wallType];
                if (!face || !face.vertices || face.vertices.length !== 4) return null;

                const projectedVertices = face.vertices.map(perspectiveProjection);
                const sortedVertices = sortVerticesClockwise(projectedVertices);
                const points = sortedVertices.map(v => `${v.x},${v.y}`).join(' ');

                return (
                    <polygon
                        key={`${roomIndex}-${sideIndex}-${wallType}`}
                        points={points}
                        fill={`url(#img-${roomIndex}-${sideIndex}-${wallType})`}
                    />
                );
            })}
        </svg>
    );
}
