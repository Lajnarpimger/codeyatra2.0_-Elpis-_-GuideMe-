import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

const ProgressBar = ({ progress, color }) => {
  const [width, setWidth] = useState(0);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) setTimeout(() => setWidth(progress), 200);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [progress]);

  return (
    <div
      ref={ref}
      style={{
        height: "100%",
        width: `${width}%`,
        background: `linear-gradient(90deg, ${color}88, ${color})`,
        borderRadius: 3,
        transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
        boxShadow: `0 0 8px ${color}60`,
      }}
    />
  );
};

export default ProgressBar;
