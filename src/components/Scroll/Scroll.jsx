import React, { useState, useEffect, useRef } from 'react';
import './Scroll.css';

function Scroll() {
  const [items, setItems] = useState(Array.from({ length: 10 }, (_, i) => `Item ${i + 1}`));
  const observerRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const scrollAmount = useRef(0); // 휠로 인한 스크롤 양
  const animationFrame = useRef(null); // requestAnimationFrame을 위한 참조
  const lastScrollTime = useRef(0); // 마지막 스크롤 시간 기록

  // 새로운 아이템 로드
  const loadMoreItems = () => {
    setItems((prev) => [
      ...prev,
      ...Array.from({ length: 10 }, (_, i) => `Item ${prev.length + i + 1}`)
    ]);
  };

  // IntersectionObserver를 사용하여 마지막 아이템이 화면에 보일 때마다 로드
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreItems();
        }
      },
      { root: scrollContainerRef.current, threshold: 1.0 }
    );

    if (observerRef.current) observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, []);

  // 마우스 휠 이벤트로 가로 스크롤
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault(); // 기본 수직 스크롤 방지

      // 휠 방향에 따라 가로 스크롤
      const scrollDelta = e.deltaY * 0.1; // 속도 조절
      scrollAmount.current += scrollDelta;
      scrollContainerRef.current.scrollLeft += scrollDelta;

      // 가로 스크롤 끝에 가까워졌을 때 새로운 아이템 로드
      const container = scrollContainerRef.current;
      const scrollPosition = container.scrollLeft;
      const scrollWidth = container.scrollWidth;
      const containerWidth = container.clientWidth;

      // 스크롤이 끝에 거의 도달했을 때 (남은 공간이 200px 이하일 때)
      if (scrollWidth - scrollPosition - containerWidth < 200) {
        loadMoreItems(); // 새로운 아이템 로드
      }

      // 스크롤이 멈춘 후 감속 적용
      const now = Date.now();
      const timeElapsed = now - lastScrollTime.current;
      
      // 일정 시간이 지난 후 감속 처리
      if (timeElapsed > 50) {
        lastScrollTime.current = now;
        cancelAnimationFrame(animationFrame.current);
        animationFrame.current = requestAnimationFrame(smoothScroll);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel); // 마우스 휠 이벤트 처리
    }

    return () => {
      if (container) container.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  const smoothScroll = () => {
    if (Math.abs(scrollAmount.current) > 0.5) {
      scrollAmount.current *= 0.9; // 감속 효과
      scrollContainerRef.current.scrollLeft += scrollAmount.current;

      animationFrame.current = requestAnimationFrame(smoothScroll);
    }
  };

  return (
    <div ref={scrollContainerRef} className="scroll-container">
      {items.map((item, index) => (
        <div key={index} className="item">
          {item}
        </div>
      ))}
      <div ref={observerRef} style={{ width: '20px' }}></div> {/* IntersectionObserver용 empty div */}
    </div>
  );
}

export default Scroll;