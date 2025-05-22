import { fabric } from 'fabric';
import PerspectiveTransform from 'perspective-transform';

/**
 * 꼭지점 4개(x, y)의 배열에 이미지를 왜곡시켜 배치
 */
export async function createPerspectiveImage(imageURL, corners, options = {}) {
    return new Promise((resolve, reject) => {
        fabric.Image.fromURL(imageURL, (img) => {
            const srcCorners = [
                [0, 0],
                [img.width, 0],
                [img.width, img.height],
                [0, img.height],
            ];
            const dstCorners = corners;

            const pt = PerspectiveTransform(srcCorners[0], srcCorners[1], srcCorners[2], srcCorners[3]);
            const transform = pt.coefficients(dstCorners[0], dstCorners[1], dstCorners[2], dstCorners[3]);

            // 새 캔버스에 수동 왜곡 처리
            const offCanvas = document.createElement('canvas');
            offCanvas.width = img.width;
            offCanvas.height = img.height;
            const ctx = offCanvas.getContext('2d');
            ctx.drawImage(img.getElement(), 0, 0);

            const distortedCanvas = applyPerspectiveToCanvas(offCanvas, transform, dstCorners);

            const fabricImage = new fabric.Image(distortedCanvas, {
                ...options,
                left: 0,
                top: 0,
                selectable: false,
                evented: false,
            });

            resolve(fabricImage);
        }, { crossOrigin: 'anonymous' });
    });
}

/**
 * Perspective 변환을 적용한 새로운 canvas 생성
 */
function applyPerspectiveToCanvas(sourceCanvas, transform, dstCorners) {
    const outputCanvas = document.createElement('canvas');
    const width = Math.max(
        Math.hypot(dstCorners[0][0] - dstCorners[1][0], dstCorners[0][1] - dstCorners[1][1]),
        Math.hypot(dstCorners[2][0] - dstCorners[3][0], dstCorners[2][1] - dstCorners[3][1])
    );
    const height = Math.max(
        Math.hypot(dstCorners[1][0] - dstCorners[2][0], dstCorners[1][1] - dstCorners[2][1]),
        Math.hypot(dstCorners[3][0] - dstCorners[0][0], dstCorners[3][1] - dstCorners[0][1])
    );

    outputCanvas.width = width;
    outputCanvas.height = height;
    const ctx = outputCanvas.getContext('2d');

    // 이미지 왜곡을 수동으로 픽셀 매핑해야 하지만, 여기선 단순화한 방식
    // 완전한 왜곡 효과는 WebGL/three.js가 더 적합함

    // 임시 방법: dst 위치에 이미지 붙이기
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 초기화
    ctx.drawImage(sourceCanvas, 0, 0, sourceCanvas.width, sourceCanvas.height, 0, 0, width, height);

    return outputCanvas;
}
