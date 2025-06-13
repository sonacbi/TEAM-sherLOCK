import React, { useEffect, useState, useRef, useMemo } from 'react';

const vanishingPoint = { x: 0, y: 0 };
const focalLength = 112;
const scale = 0.083;
const offsetX = -46.0;
const offsetY = -27.5;

const WALL_TYPES = ['bottom', 'top', 'left', 'right', 'front', 'back'];

export function perspectiveProjection(vertex) {
    const z = Math.max(vertex.z || 0.1, 0.1);

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
    return vertices.slice().sort((a, b) => a.originalIndex - b.originalIndex);
    }

    export default function PerspectiveSVG({
    perspectiveWalls,
    roomData,
    roomIndex,
    sideIndex,
    isPerspectiveUpdated,
    setIsPerspectiveUpdated,
    }) {
    // 훅은 무조건 최상단에서 호출 (조건 없이)
    const svgRef = useRef(null);
    const [imgDataUrl, setImgDataUrl] = useState(null);

    // 무조건 top-level에서 훅 호출
    const side = perspectiveWalls?.[roomIndex]?.[sideIndex] || null;

    const allProjectedPoints = useMemo(() => {
        if (!side || !WALL_TYPES) return []; // side 없어도 훅은 항상 호출됨
        const points = [];
        WALL_TYPES.forEach((wallType) => {
        const face = side[wallType];
        if (!face || !face.vertices || face.vertices.length !== 4) return;
        points.push(...face.vertices.map(perspectiveProjection));
        });
        return points;
    }, [side]);

    const viewBox = useMemo(() => {
        if (allProjectedPoints.length === 0) return null;

        const svgWidth = 90;
        const svgHeight = 55;

        const xs = allProjectedPoints.map((p) => p.x);
        const ys = allProjectedPoints.map((p) => p.y);

        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);

        const width = maxX - minX;
        const height = maxY - minY;

        const svgAspect = svgWidth / svgHeight;
        const boxAspect = width / height;

        let scaleFactor;
        if (boxAspect > svgAspect) {
        scaleFactor = svgWidth / width;
        } else {
        scaleFactor = svgHeight / height;
        }

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const scaledPoints = allProjectedPoints.map((p) => ({
        x: (p.x - centerX) * scaleFactor,
        y: (p.y - centerY) * scaleFactor,
        }));

        const scaledXs = scaledPoints.map((p) => p.x);
        const scaledYs = scaledPoints.map((p) => p.y);

        const vMinX = Math.min(...scaledXs);
        const vMaxX = Math.max(...scaledXs);
        const vMinY = Math.min(...scaledYs);
        const vMaxY = Math.max(...scaledYs);

        return {
        scaleFactor,
        centerX,
        centerY,
        viewBoxX: vMinX,
        viewBoxY: vMinY,
        viewBoxWidth: vMaxX - vMinX,
        viewBoxHeight: vMaxY - vMinY,
        };
    }, [allProjectedPoints]);

    useEffect(() => {
        if (!isPerspectiveUpdated) return;
        if (!svgRef.current) {
            setImgDataUrl(null);
            setIsPerspectiveUpdated(false);
            return;
        }

        const raf = requestAnimationFrame(() => {
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgRef.current);
            const encodedData = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
            setImgDataUrl(encodedData);
            setIsPerspectiveUpdated(false);
        });

        return () => cancelAnimationFrame(raf);
    }, [isPerspectiveUpdated, setIsPerspectiveUpdated]);


    // 조건은 렌더링 제어에만 사용
    if (!roomData || !side || allProjectedPoints.length === 0 || !viewBox) return null;

    if (isPerspectiveUpdated) {
        return (
        <svg
            ref={svgRef}
            width={90}
            height={55}
            viewBox={`${viewBox.viewBoxX} ${viewBox.viewBoxY} ${viewBox.viewBoxWidth} ${viewBox.viewBoxHeight}`}
            preserveAspectRatio="xMidYMid meet"
            style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
        >
            <defs>
            {WALL_TYPES.map((wallType) => {
                const face = side[wallType];
                if (!face || !face.imageUrl || !face.vertices || face.vertices.length !== 4) return null;

                const projectedVertices = face.vertices.map(perspectiveProjection);
                const xs = projectedVertices.map((v) => v.x);
                const ys = projectedVertices.map((v) => v.y);
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

            {WALL_TYPES.map((wallType) => {
            const face = side[wallType];
            if (!face || !face.vertices || face.vertices.length !== 4) return null;

            const projectedVertices = face.vertices.map(perspectiveProjection);
            const sortedVertices = sortVerticesClockwise(projectedVertices);
            const points = sortedVertices.map((v) => `${v.x},${v.y}`).join(' ');

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

    if (imgDataUrl) {
        return <img src={imgDataUrl} alt="Perspective Preview" width={90} height={55} />;
    }

    return null;
}
