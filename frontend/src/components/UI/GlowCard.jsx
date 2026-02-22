import React from "react";
import { useRef } from "react";
import { useState } from "react";

const GlowCard = ({ children, style = {} }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const ref = useRef();

  const handleMouseMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 16,
        border: "1px solid rgba(59,130,246,0.15)",
        background: "rgba(8,15,40,0.8)",
        transition: "border-color 0.3s, transform 0.3s, box-shadow 0.3s",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(59,130,246,0.3)"
          : "0 4px 20px rgba(0,0,0,0.2)",
        ...style,
      }}
    >
      {hovered && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            left: mousePos.x - 100,
            top: mousePos.y - 100,
            transition: "none",
          }}
        />
      )}
      {children}
    </div>
  );
};

export default GlowCard;
