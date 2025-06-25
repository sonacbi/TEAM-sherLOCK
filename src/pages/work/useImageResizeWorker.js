import { useRef, useEffect } from 'react';

const useImageResizeWorker = () => {
  const workerRef = useRef();
  const resolveMap = useRef(new Map()); // 요청 ID -> resolve 함수 매핑
  const idCounter = useRef(0);

  useEffect(() => {
    workerRef.current = new Worker(new URL('./resize.worker.js', import.meta.url));

    workerRef.current.onmessage = (e) => {
      const { id, blob } = e.data;
      const resolve = resolveMap.current.get(id);
      if (resolve) {
        resolveMap.current.delete(id);
        resolve(new File([blob], e.data.name, { type: e.data.type }));
      }
    };

    return () => {
      workerRef.current.terminate();
      resolveMap.current.clear();
    };
  }, []);

  const resizeImage = (file, maxWidth = 500) => {
    return new Promise((resolve) => {
      const id = idCounter.current++;
      resolveMap.current.set(id, resolve);
      workerRef.current.postMessage({ id, file, maxWidth });
    });
  };

  return resizeImage;
};

export default useImageResizeWorker;
