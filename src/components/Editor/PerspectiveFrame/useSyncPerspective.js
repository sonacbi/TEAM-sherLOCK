import { useEffect } from 'react';

const useSyncPerspective = (
  canvasInstance,
  getWallsFromCanvas,
  getWallVertices,
  setPerspective,
  currentRoom,
  currentSide
) => {
  useEffect(() => {
    const canvas = canvasInstance.current;
    if (!canvas) return;

    const updatePerspectiveVertices = () => {
      const walls = getWallsFromCanvas(canvas);
      if (!walls.length) return;

      setPerspective(prev => {
        const updated = { ...prev };

        if (!updated[currentRoom]) {
          updated[currentRoom] = {};
        }
        if (!updated[currentRoom][currentSide]) {
          updated[currentRoom][currentSide] = {};
        }

        walls.forEach(wall => {
          const wallType = wall.get('wallType');
          const vertices = getWallVertices(wall);

          if (vertices.length) {
            updated[currentRoom][currentSide][wallType] = {
              ...(updated[currentRoom][currentSide][wallType] || {}),
              vertices: [...vertices],
            };
          }
        });

        return updated;
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
  }, [currentRoom, currentSide]);
};

export default useSyncPerspective;
