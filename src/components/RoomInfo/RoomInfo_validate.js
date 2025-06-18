import { useState, useRef } from 'react';

export const useTitleByteHandler = (maxBytes = 100, title, setTitle, byteLength, setByteLength, titleMessage, setTitleMessage) => {
  const getByteLength = (str) => new TextEncoder().encode(str).length;

  const handleTitle = (e) => {
  let value = e.target.value;
  const trimmed = value.trim();
  let encoded = new TextEncoder().encode(value);
  let bytes = getByteLength(value);

  // 만약 현재 메시지가 에러 메시지라면 덮어쓰지 말자
  const isErrorMessage = titleMessage === '제목을 입력해주세요.' || titleMessage === `${maxBytes}byte를 넘길 수 없습니다.`;

  if (trimmed.length === 0) {
    setTitle('');
    setByteLength(bytes);
    if (!isErrorMessage) {  // 에러 메시지가 없을 때만 바이트 메시지 업데이트
      setTitleMessage(`${bytes} / ${maxBytes} bytes 사용 중`);
    }
    return;
  }

  if (bytes <= maxBytes) {
    setTitle(value);
    setByteLength(bytes);
    if (!isErrorMessage) {
      setTitleMessage(`${bytes} / ${maxBytes} bytes 사용 중`);
    }
  } else {
    while (bytes > maxBytes) {
      encoded = encoded.slice(0, -1);
      value = new TextDecoder().decode(encoded);
      bytes = getByteLength(value);
    }
    setTitle(value);
    setByteLength(bytes);
    setTitleMessage(`${maxBytes}byte를 넘길 수 없습니다.`);
  }
};


  const handleTitleBlur = () => {
    setTitleMessage(`${byteLength} / ${maxBytes} bytes 사용 중`);
  };

  return {
    title,
    byteLength,
    titleMessage,
    handleTitle,
    handleTitleBlur,
  };
};

export const useThumbnailUpload =
(setThumbnail, thumbnailSrc, setThumbnailSrc, thumbnailMessage, setThumbnailMessage, showModal, setShowModal, showConfirmButtons, setShowConfirmButtons, modalFadeOut, setModalFadeOut, modalMessage, setModalMessage, modalTimeoutRef) => {

  const compressedDataRef = useRef(null);
  const compressedDataUrlRef = useRef(null);

  const maxSize = 360 * 1024; // 360KB
  const minWidth = 380;
  const minHeight = 480;

  const handleAcceptCompression = () => {
    setThumbnail(compressedDataRef.current);
    setThumbnailSrc(compressedDataUrlRef.current);
    setThumbnailMessage('');
    setShowConfirmButtons(false);
    setShowModal(false);
  };

  const handleRejectCompression = () => {
    setThumbnailMessage('이미지 업로드가 취소되었습니다.');
    setShowConfirmButtons(false);
    setThumbnail(null);
    setThumbnailSrc(null);
    setModalFadeOut(false);
    setShowModal(false);

    setTimeout(() => {
      setModalFadeOut(true);
      setTimeout(() => setThumbnailMessage(''), 500);
    }, 3000);
  };

  const handleImageUpload = (e) => {
    const fileInput = e.target;
    const file = fileInput.files[0];
    if (!file) return;

    setShowConfirmButtons(false);

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!allowedTypes.includes(file.type)) {
      showAutoModal('JPEG, JPG, PNG 형식의 파일만 업로드할 수 있습니다.');
      fileInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (event) {
      const img = new Image();
      img.onload = function () {
        if (img.width < minWidth || img.height < minHeight) {
          showAutoModal(`업로드한 이미지 ${img.width}x${img.height}px<br />(최소 ${minWidth}x${minHeight}px 이상 업로드 요망)`);
          fileInput.value = '';
          return;
        }

        if (file.size > maxSize) {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          let quality = 0.6;
          let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

          while (compressedDataUrl.length > maxSize * 1.37 && quality > 0.2) {
            quality -= 0.1;
            compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          }

          function dataURLtoBlob(dataurl) {
            const arr = dataurl.split(',');
            const mime = arr[0].match(/:(.*?);/)[1];
            const bstr = atob(arr[1]); // base64 디코딩
            let n = bstr.length;
            const u8arr = new Uint8Array(n);

            while (n--) {
              u8arr[n] = bstr.charCodeAt(n);
            }

            return new Blob([u8arr], { type: mime });
          }
          const blob = dataURLtoBlob(compressedDataUrl);
          compressedDataRef.current = new File([blob], file.name, { type: blob.type });
          compressedDataUrlRef.current = compressedDataUrl;
          setModalMessage('이미지 용량이 360KB를 초과합니다. 용량을 자동으로 압축해서 업로드하시겠습니까?');
          setShowConfirmButtons(true);
          setShowModal(true);
        } else {
          const imageUrl = URL.createObjectURL(file);
          setThumbnail(file);
          setThumbnailSrc(imageUrl);
          fileInput.value = '';
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const showAutoModal = (message) => {
    // 기존 타이머 제거
    if (modalTimeoutRef.current) {
      clearTimeout(modalTimeoutRef.current);
    }

    setThumbnailMessage(message);
    setShowConfirmButtons(false);
    setModalFadeOut(false);

    modalTimeoutRef.current = setTimeout(() => {
      setModalFadeOut(true);
      modalTimeoutRef.current = setTimeout(() => {
        setThumbnailMessage('');
      }, 500);

    }, 6000);
  };

  return {
    thumbnailSrc,
    thumbnailMessage,
    showModal,
    showConfirmButtons,
    modalFadeOut,
    modalMessage,
    handleImageUpload,
    handleAcceptCompression,
    handleRejectCompression,
  };
};

export const getByteLength = (str) => {
  return new Blob([str]).size;
};

export const validateScription = (text, maxBytes = 1000) => {
  const tagPattern = /<\/?[^>]+>/gi;
  if (tagPattern.test(text)) {
    return 'HTML태그는 사용할 수 없습니다.';
  }

  const entityPattern = /&[a-z]+;/gi;
  if (entityPattern.test(text)) {
    return '특수 문자는 입력할 수 없습니다.';
  }

  if (getByteLength(text) > maxBytes) {
    return `${maxBytes}byte 이내로 입력해주세요.`;
  }

  return '';
};

export const validatePlaytime = (h, m) => {
  const hour = h === '' ? 0 : parseInt(h, 10);
  const min = m === '' ? 0 : parseInt(m, 10);

  if (isNaN(hour) || isNaN(min)) {
    return '시간에 숫자만 입력해주세요.';
  }

  if (hour < 0 || hour > 3) {
    return '시간(h)은 0~3 사이의 숫자여야 합니다.';
  }

  if (min < 0 || min >= 60) {
    return '분(m)은 0~59 사이로 입력해주세요.';
  }

  const totalMinutes = hour * 60 + min;
  if (totalMinutes > 180) {
    return '총 플레이타임은 3시간(180분)을 넘길 수 없습니다.';
  }

  if (hour === 0 && min === 0) {
    return '시간에 0만 입력할 수 없습니다.';
  }

  return '';
};

