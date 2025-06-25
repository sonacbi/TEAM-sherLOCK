// resize.worker.js
self.onmessage = async (e) => {
  const { file, maxWidth } = e.data;
  const bitmap = await createImageBitmap(file);

  const scale = Math.min(maxWidth / bitmap.width, 1);
  const width = bitmap.width * scale;
  const height = bitmap.height * scale;

  const offscreen = new OffscreenCanvas(width, height);
  const ctx = offscreen.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, width, height);

  const blob = await offscreen.convertToBlob({ type: file.type });
  self.postMessage({ blob }); // 🔴 두 번째 인자 제거
};