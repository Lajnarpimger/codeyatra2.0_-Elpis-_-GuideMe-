import React from "react";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";

const ScrollReveal = ({
  children,
  delay = 0,
  direction = "up",
  className = "",
}) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.1 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const transforms = {
    up: visible ? "translateY(0)" : "translateY(40px)",
    down: visible ? "translateY(0)" : "translateY(-40px)",
    left: visible ? "translateX(0)" : "translateX(-40px)",
    right: visible ? "translateX(0)" : "translateX(40px)",
    scale: visible ? "scale(1)" : "scale(0.9)",
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        opacity: visible ? 1 : 0,
        transform: transforms[direction] || transforms.up,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
