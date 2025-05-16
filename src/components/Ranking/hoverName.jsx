import React, { useState, useRef, useEffect } from "react";
import "./hoverName.css";

const HoverName = ({ name, index }) => {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [shouldScroll, setShouldScroll] = useState(false);
  const [scrollDistance, setScrollDistance] = useState(0);
  const [duration, setDuration] = useState("0s");
  const [transitionEnabled, setTransitionEnabled] = useState(false);

  const isTopRank = index === 0;
  const scrollSpeed = 40; // px per second

  useEffect(() => {
    if (textRef.current && containerRef.current) {
      const textWidth = textRef.current.scrollWidth;
      const containerWidth = containerRef.current.offsetWidth;
      const distance = textWidth - containerWidth;

      if (distance > 0 && !isTopRank) {
        setShouldScroll(true);
        setScrollDistance(distance);
        setDuration(`${distance / scrollSpeed}s`);
      } else {
        setShouldScroll(false);
        setDuration("0s");
      }
    }
  }, [name, isTopRank]);

  const handleMouseEnter = () => {
    if (isTopRank) return;
    setTransitionEnabled(true);
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (isTopRank) return;
    setTransitionEnabled(false);
    setIsHovering(false);
  };

  return (
    <div
      className={`hover-name-container ${isTopRank ? "top-rank" : ""}`}
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        className="hover-name-text"
        ref={textRef}
        style={{
          transform:
            isHovering && shouldScroll ? `translateX(-${scrollDistance}px)` : "translateX(0)",
          transition: transitionEnabled
            ? `transform ${duration} linear`
            : "none",
          whiteSpace: isTopRank || isHovering ? "normal" : "nowrap",
          overflow: isTopRank || isHovering ? "visible" : "hidden",
          textOverflow: isTopRank || isHovering ? "clip" : "ellipsis",
        }}

      >
        {name}
      </div>
    </div>
  );
};

export default HoverName;
