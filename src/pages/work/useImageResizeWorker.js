import { useRef, useEffect } from 'react';

const useImageResizeWorker = () => {
  const workerRef = useRef();

  useEffect(() => {
    workerRef.current = new Worker(new URL('./resize.worker.js', import.meta.url));
    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const resizeImage = (file, maxWidth = 500) => {
    return new Promise((resolve) => {
      workerRef.current.onmessage = (e) => {
        const { blob } = e.data;
        const resizedFile = new File([blob], file.name, { type: file.type });
        resolve(resizedFile);
      };
      workerRef.current.postMessage({ file, maxWidth });
    });
  };

  return resizeImage;
};

export default useImageResizeWorker;
