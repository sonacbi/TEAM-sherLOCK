import { useEffect, useRef } from 'react';
import * as fabric from 'fabric';

/**
 * Delete 키로 선택된 오브젝트 제거
 */
export const useDeleteKeyHandler = (canvasInstance, isReady, setImgs, game, setNamedFabrics) => {
    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Delete') {
                const activeObject = canvas.getActiveObject();

                const tryRemoveImage = (obj) => {
                    if (obj.type === 'image' && obj.imgName) {
                        const allObjects = canvas.getObjects();
                        const sameNameImages = allObjects.filter(o => o.type === 'image' && o.imgName === obj.imgName);
                        // 같은 이름을 가진 이미지가 하나뿐일 때만 이미지 목록에서도 삭제
                        if (sameNameImages.length === 1) setImgs(prevImgs => prevImgs.filter(img => img.name !== obj.imgName));
                    }
                };
                const tryRemoveNamedFabric = (obj) => {
                    if (obj.id && obj.name) {
                        setNamedFabrics(prev => prev.filter(named => named.id !== obj.id && named.name !== obj.name));
                    }
                }

                if (activeObject) {
                    if (activeObject instanceof fabric.ActiveSelection) {
                        activeObject.forEachObject(obj => {
                            tryRemoveImage(obj);
                            if (obj.name !== "SherLockRoomController") canvas.remove(obj)
                            tryRemoveNamedFabric(obj);
                        });
                    } else {
                        tryRemoveImage(activeObject);
                        if (activeObject.name !== "SherLockRoomController") canvas.remove(activeObject);
                        tryRemoveNamedFabric(activeObject);
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

        const onDocumentMouseDown = (e) => {
            const target = e.target;
            const isInsideTool = target.closest?.('.tool_fine_tuning');

            if (!isCanvasClicked && !isInsideTool) {
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

/**
 * 객체 복사 및 붙여놓기
 */
export const useCopyNPaste = (canvasInstance, controlStyle) => {
    const clipboardRef = useRef(null);

    useEffect(() => {
        const canvas = canvasInstance.current;
        if (!canvas) return;

        const handleKeyDown = async (e) => {
            const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
            const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

            if (!ctrlKey) return;

            // COPY
            if (e.key === 'c' || e.key === 'C') {
                const activeObject = canvas.getActiveObject();
                if (activeObject) {
                    activeObject.clone(['gameEvent', 'imgName', 'shapeType', 'perPixelTargetFind']).then(clonedObj => clipboardRef.current = clonedObj);
                    e.preventDefault();
                }
            }

            // PASTE
            if (e.key === 'v' || e.key === 'V') {
                const clipboard = clipboardRef.current;
                if (!clipboard) return;

                clipboard.clone(['gameEvent', 'imgName', 'shapeType', 'perPixelTargetFind']).then(async (clonedObj) => {
                    canvas.discardActiveObject();

                    clonedObj.set({
                        ...controlStyle,
                        left: clonedObj.left + 15,
                        top: clonedObj.top + 15,
                        gameEvent: clipboard.gameEvent,
                        imgName: clipboard.imgName,
                        perPixelTargetFind: clipboard.perPixelTargetFind,
                    });

                    if (clonedObj instanceof fabric.ActiveSelection) {
                        clonedObj.canvas = canvas;
                        clonedObj.forEachObject(obj => {
                            obj.set(controlStyle);
                            if (obj.type == 'textbox') obj.set({perPixelTargetFind: false});
                            canvas.add(obj);
                        });
                        clonedObj.setCoords();
                    } else {
                        canvas.add(clonedObj);
                    }

                    clipboardRef.current.left += 15;
                    clipboardRef.current.top += 15;

                    canvas.setActiveObject(clonedObj);
                    canvas.requestRenderAll();
                });

                e.preventDefault();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [canvasInstance]);
};