import * as fabric from 'fabric';

export const getShapeByType = (shapeType, controlStyle) => {
    let shape;

    switch (shapeType) {
        case 'rectangle':
            shape = new fabric.Rect({
                ...controlStyle,
                left: 100,
                top: 100,
                fill: '#A9DB78',
                width: 100,
                height: 100,
                stroke: '#008C1A',
                strokeWidth: 2,
                strokeUniform: true,
            });
            break;

        case 'circle':
            shape = new fabric.Circle({
                ...controlStyle,
                left: 100,
                top: 100,
                fill: '#A9DB78',
                radius: 50,
                stroke: '#008C1A',
                strokeWidth: 2,
                strokeUniform: true,
            });
            break;

        case 'triangle':
            shape = new fabric.Triangle({
                ...controlStyle,
                left: 100,
                top: 100,
                fill: '#A9DB78',
                width: 100,
                height: 100,
                stroke: '#008C1A',
                strokeWidth: 2,
                strokeUniform: true,
            });
            break;

        case 'rhombus':
            shape = new fabric.Polygon([
                { x: 50, y: 0 },
                { x: 100, y: 50 },
                { x: 50, y: 100 },
                { x: 0, y: 50 }
            ], {
                ...controlStyle,
                left: 100,
                top: 100,
                fill: '#A9DB78',
                stroke: '#008C1A',
                strokeWidth: 2,
                strokeUniform: true,
                shapeType: 'rhombus',
            });
            break;

        case 'star':
            const centerX = 50;
            const centerY = 50;
            const outerRadius = 50;
            const innerRadius = 25;
            const points = [];

            for (let i = 0; i < 10; i++) {
                const angle = (Math.PI / 5) * i;
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                points.push({
                    x: centerX + radius * Math.cos(angle - Math.PI / 2),
                    y: centerY + radius * Math.sin(angle - Math.PI / 2),
                });
            }

            shape = new fabric.Polygon(points, {
                ...controlStyle,
                left: 100,
                top: 100,
                fill: '#A9DB78',
                stroke: '#008C1A',
                strokeWidth: 2,
                strokeUniform: true,
                shapeType: 'star',
            });
            break;

        case 'heart':
            const heartPath = `
                M 10,30
                A 20,20 0 0,1 50,30
                A 20,20 0 0,1 90,30
                Q 90,60 50,90
                Q 10,60 10,30
                Z
            `;
            shape = new fabric.Path(heartPath, {
                ...controlStyle,
                left: 100,
                top: 100,
                fill: '#A9DB78',
                stroke: '#008C1A',
                strokeWidth: 2,
                strokeUniform: true,
                // scaleX: 1.3,
                // scaleY: 1.3,
                shapeType: 'heart',
            });
            break;

        case 'pentagon':
            const pentagonSize = 60;
            const pentagonCenterX = 150;
            const pentagonCenterY = 150;
            const pentagonPoints = [];

            for (let i = 0; i < 5; i++) {
                const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                pentagonPoints.push({
                    x: pentagonCenterX + pentagonSize * Math.cos(angle),
                    y: pentagonCenterY + pentagonSize * Math.sin(angle),
                });
            }

            shape = new fabric.Polygon(pentagonPoints, {
                ...controlStyle,
                fill: '#A9DB78',
                stroke: '#008C1A',
                strokeWidth: 2,
                strokeUniform: true,
                left: pentagonCenterX,
                top: pentagonCenterY,
                originX: 'center',
                originY: 'center',
                shapeType: 'pentagon',
            });
            break;

        case 'trapezoid':
            const topLeftX = 70;
            const topRightX = 130;
            const topY = 20;
            const bottomY = 120;
            const bottomWidth = 100;
            const centerXPos = (topLeftX + topRightX) / 2;
            const bottomLeftX = centerXPos - bottomWidth / 2;
            const bottomRightX = centerXPos + bottomWidth / 2;

            shape = new fabric.Polygon([
                { x: topLeftX, y: topY },
                { x: topRightX, y: topY },
                { x: bottomRightX, y: bottomY },
                { x: bottomLeftX, y: bottomY },
            ], {
                ...controlStyle,
                fill: '#A9DB78',
                stroke: '#008C1A',
                strokeWidth: 2,
                strokeUniform: true,
                left: 150,
                top: 150,
                originX: 'center',
                originY: 'center',
                shapeType: 'trapezoid',
            });
            break;

        default:
            return null;
    }

    return shape;
};