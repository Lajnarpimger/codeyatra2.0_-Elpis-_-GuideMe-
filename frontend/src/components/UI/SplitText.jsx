import React from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";

const SplitText = ({ text, className = "", delay = 0, stagger = 0.04 }) => {
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

  return (
    <span ref={ref} className={className} aria-label={text}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          aria-hidden="true"
          style={{
            display: "inline-block",
            transition: `opacity 0.5s ease ${delay + i * stagger}s, transform 0.5s ease ${delay + i * stagger}s`,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </span>
      ))}
    </span>
  );
};

export default SplitText;
