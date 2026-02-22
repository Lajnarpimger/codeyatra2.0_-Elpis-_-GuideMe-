import { Check, X } from "lucide-react";
import React from "react";

const Toast = ({ message, type = "success" }) => {
  const colors = {
    success: {
      bg: "rgba(34,197,94,0.12)",
      border: "rgba(34,197,94,0.25)",
      text: "#22c55e",
    },
    error: {
      bg: "rgba(248,113,113,0.12)",
      border: "rgba(248,113,113,0.25)",
      text: "#f87171",
    },
  };
  const c = colors[type] || colors.success;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        zIndex: 9999,
        padding: "14px 20px",
        borderRadius: 10,
        backdropFilter: "blur(20px)",
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        fontWeight: 500,
        boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        animation: "slide-in-right 0.3s ease",
        display: "flex",
        alignItems: "center",
        gap: 10,
        maxWidth: 360,
      }}
    >
      {type === "success" ? <Check size={16} /> : <X size={16} />}
      {message}
    </div>
  );
};

export default Toast;
