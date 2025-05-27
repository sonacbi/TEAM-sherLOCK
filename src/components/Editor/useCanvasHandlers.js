import { useEffect } from 'react';
import * as fabric from 'fabric';

/**
 * Delete 키로 선택된 오브젝트 제거
 */
export const useDeleteKeyHandler = (canvasInstance, isReady) => {
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Delete') {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    if (activeObject instanceof fabric.ActiveSelection) {
                        activeObject.forEachObject(obj => canvas.remove(obj));
                    } else {
                        canvas.remove(activeObject);
                    }
                    canvas.discardActiveObject();
                    canvas.renderAll();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [canvasInstance, isReady]);
};

/**
 * Ctrl + 마우스 휠로 줌 인/아웃
 */
export const useCanvasZoom = (canvasInstance, isReady) => {
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const handleWheel = (e) => {
            if (!e.ctrlKey) return;
            e.preventDefault();

            let zoom = canvas.getZoom();
            zoom *= e.deltaY > 0 ? 0.9 : 1.1;
            zoom = Math.min(Math.max(zoom, 0.5), 5);

            canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
            canvas.renderAll();
        };

        const upperCanvas = canvas.upperCanvasEl;
        if (upperCanvas) {
            upperCanvas.addEventListener('wheel', handleWheel, { passive: false });
        }

        return () => {
            if (upperCanvas) {
                upperCanvas.removeEventListener('wheel', handleWheel);
            }
        };
    }, [canvasInstance, isReady]);
};

/**
 * 캔버스 외부 클릭 시 선택 해제
 */
export const useCanvasClickDeselect = (canvasInstance, onObjectSelect) => {
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        let isCanvasClicked = false;

        const onCanvasMouseDown = () => {
            isCanvasClicked = true;
        };

        const onDocumentMouseDown = () => {
            if (!isCanvasClicked) {
                canvas.discardActiveObject();
                canvas.requestRenderAll();
                onObjectSelect(null);
            }
            isCanvasClicked = false;
        };

        canvas.on('mouse:down', onCanvasMouseDown);
        document.addEventListener('mousedown', onDocumentMouseDown);

        return () => {
            canvas.off('mouse:down', onCanvasMouseDown);
            document.removeEventListener('mousedown', onDocumentMouseDown);
        };
    }, [canvasInstance, onObjectSelect]);
};