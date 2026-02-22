import React from "react";
import { useRef } from "react";
import { useState } from "react";

const MagneticButton = ({
  children,
  className = "",
  onClick,
  type = "button",
  disabled = false,
}) => {
  const ref = useRef();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setPos({ x: (e.clientX - cx) * 0.3, y: (e.clientY - cy) * 0.3 });
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setPos({ x: 0, y: 0 });
      }}
      className={className}
      style={{
        transform: hovered
          ? `translate(${pos.x}px, ${pos.y}px)`
          : "translate(0,0)",
        transition: hovered ? "transform 0.1s ease" : "transform 0.4s ease",
      }}
    >
      {children}
    </button>
  );
};

export default MagneticButton;
