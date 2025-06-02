import { useEffect } from 'react';

const useSyncPerspective = (canvasInstance, getWallsFromCanvas, getWallVertices, setPerspective) => {
  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas) return;

    const updatePerspectiveVertices = () => {
      const walls = getWallsFromCanvas(canvas);
      const rects = canvas.getObjects().filter(obj => obj.type === 'rect');

      if (!walls.length && !rects.length) return;

      setPerspective(prev => {
        const updatedPerspective = { ...prev };

        walls.forEach(wall => {
          const wallType = wall.get('wallType');
          const vertices = getWallVertices(wall);

          if (vertices.length) {
            updatedPerspective[wallType] = {
              ...(prev[wallType] || {}),
              vertices: [...vertices],
            };
          }
        });

        return updatedPerspective;
      });
    };

    canvas.on('object:added', updatePerspectiveVertices);
    canvas.on('object:modified', updatePerspectiveVertices);
    canvas.on('object:removed', updatePerspectiveVertices);

    updatePerspectiveVertices();

    return () => {
      canvas.off('object:added', updatePerspectiveVertices);
      canvas.off('object:modified', updatePerspectiveVertices);
      canvas.off('object:removed', updatePerspectiveVertices);
    };
  }, []);
};

export default useSyncPerspective;
