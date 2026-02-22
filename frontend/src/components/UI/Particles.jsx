import React from "react";

const Particles = () => {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    size: Math.random * 4 + 1,
    x: Math.random * 100,
    y: Math.random * 100,
    duration: Math.random * 10 + 8,
    delay: Math.random * 5,
    opacity: Math.random * 0.4 + 0.1,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: `rgba(59,130,246,${p.opacity})`,
            boxShadow: `0 0 ${p.size * 3}px rgba(59,130,246,0.5)`,
            animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes float {
          from { transform: translate(0, 0) scale(1); }
          to { transform: translate(${Math.random > 0.5 ? "" : "-"}${Math.random * 30 + 10}px, -${Math.random * 40 + 20}px) scale(1.2); }
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes slide-in-right {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Particles;
