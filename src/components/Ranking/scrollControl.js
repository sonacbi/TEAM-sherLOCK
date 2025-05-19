// scrollControl.js

let isScrollLocked = false;

export const lockFullpageScroll = () => {
  if (window.fullpage_api && !isScrollLocked) {
    window.fullpage_api.setAllowScrolling(false);
    isScrollLocked = true;
  }
};

export const unlockFullpageScroll = () => {
  if (window.fullpage_api && isScrollLocked) {
    window.fullpage_api.setAllowScrolling(true);
    isScrollLocked = false;
  }
};

export const attachScrollControlEvents = (element, options = { wheel: false }) => {
  if (!element) return;

  const onMouseEnter = () => lockFullpageScroll();
  const onMouseLeave = () => unlockFullpageScroll();

  const onWheel = (e) => {
    if (!options.wheel) return;

    e.preventDefault();

    // 스크롤 위치 이동
    element.scrollTop += e.deltaY;

    // 스크롤 끝 감지
    const atTop = element.scrollTop === 0;
    const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight;

    // 스크롤 끝에 도달했으면 이벤트 전파를 막아 부모(fullpage) 스크롤로 넘어가지 않도록
    if ((e.deltaY < 0 && atTop) || (e.deltaY > 0 && atBottom)) {
      e.stopPropagation();
      // 필요 시 이 위치에서 unlockFullpageScroll() 호출해서 풀페이지 스크롤 허용할 수도 있지만
      // 마우스가 여전히 요소 안에 있다면 보통은 계속 잠금 유지
    }
  };

  element.addEventListener('mouseenter', onMouseEnter);
  element.addEventListener('mouseleave', onMouseLeave);
  if (options.wheel) element.addEventListener('wheel', onWheel, { passive: false });

  return () => {
    element.removeEventListener('mouseenter', onMouseEnter);
    element.removeEventListener('mouseleave', onMouseLeave);
    if (options.wheel) element.removeEventListener('wheel', onWheel);
  };
};

