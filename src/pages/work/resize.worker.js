// resize.worker.js
/**
 * 이 파일은 Web Worker를 사용하여 이미지 리사이징 작업을 수행합니다.
 * 
 * Web Worker는 메인 스레드와 별개로 동작하는 백그라운드 스레드로,
 * 이미지처럼 무거운 작업을 별도의 스레드에서 처리해
 * UI가 멈추지 않고 부드럽게 동작하도록 도와줍니다.
 * 
 * 이 코드는 워커와 메시지 통신(postMessage, onmessage)을 통해
 * 이미지 파일을 받고 리사이징한 뒤, 다시 메인 스레드에 결과를 전달합니다.
 */

self.onmessage = async (e) => {
  const { id, file, maxWidth } = e.data;  // id 추가 받기
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(maxWidth / bitmap.width, 1);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;

  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await offscreen.convertToBlob({ type: file.type });
  self.postMessage({ id, blob, name: file.name, type: file.type });  // id 포함해서 응답
};
