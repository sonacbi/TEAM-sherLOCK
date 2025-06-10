// PerspectiveSVG.jsx

import React from 'react';

const vanishingPoint = { x: 0, y: 0 };
const focalLength = 112;
const scale = 0.000000074;
const offsetX = -46;
const offsetY = -27.5;

export function perspectiveProjection(vertex) {
    const z = vertex.z || 0.0001;
    const x = vanishingPoint.x + ((vertex.x - vanishingPoint.x) * focalLength) / z;
    const y = vanishingPoint.y + ((vertex.y - vanishingPoint.y) * focalLength) / z;
    return {
        x: x * scale + offsetX,
        y: y * scale + offsetY,
    };
}

export function sortVerticesClockwise(vertices) {
    const center = vertices.reduce(
        (acc, v) => ({ x: acc.x + v.x / vertices.length, y: acc.y + v.y / vertices.length }),
        { x: 0, y: 0 }
    );
    return [...vertices].sort((a, b) => {
        const angleA = Math.atan2(a.y - center.y, a.x - center.x);
        const angleB = Math.atan2(b.y - center.y, b.x - center.x);
        return angleA - angleB;
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
