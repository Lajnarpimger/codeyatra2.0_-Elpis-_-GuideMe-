import { GraduationCap } from "lucide-react";
import React from "react";
import GlowCard from "./GlowCard";

const AuthCard = ({ children, title, subtitle }) => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 2rem 80px",
        background:
          "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(29,78,216,0.15) 0%, transparent 70%)",
      }}
    >
      <GlowCard style={{ width: "100%", maxWidth: 440, padding: "48px 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 20px",
              boxShadow: "0 0 30px rgba(59,130,246,0.4)",
            }}
          >
            <GraduationCap size={28} color="white" />
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              marginBottom: 8,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            {subtitle}
          </p>
        </div>
        {children}
      </GlowCard>
    </div>
  );
};

export default AuthCard;
