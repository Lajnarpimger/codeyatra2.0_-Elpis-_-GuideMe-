import React from "react";

const GridBag = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        backgroundImage: `
        linear-gradient(rgba(59,130,246,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(59,130,246,0.04) 1px, transparent 1px)
      `,
        backgroundSize: "60px 60px",
      }}
    />
  );
};

export default GridBag;
