import { Eye, EyeOff } from "lucide-react";
import React from "react";
import { useState } from "react";

const FloatingInput = ({
  label,
  type = "text",
  value,
  onChange,
  icon: Icon,
  error,
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue = value && value.length > 0;
  const inputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ position: "relative", marginBottom: 8 }}>
      <div
        style={{
          position: "relative",
          border: `1px solid ${error ? "rgba(248,113,113,0.5)" : focused ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
          borderRadius: 10,
          background: focused
            ? "rgba(59,130,246,0.04)"
            : "rgba(255,255,255,0.02)",
          transition: "all 0.2s ease",
          boxShadow: focused ? "0 0 0 3px rgba(59,130,246,0.1)" : "none",
        }}
      >
        {Icon && (
          <div
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: focused ? "#3b82f6" : "rgba(255,255,255,0.3)",
              transition: "color 0.2s",
            }}
          >
            <Icon size={17} />
          </div>
        )}
        <label
          style={{
            position: "absolute",
            left: Icon ? 44 : 14,
            top: "50%",
            transform:
              focused || hasValue
                ? "translateY(-150%) scale(0.8)"
                : "translateY(-50%)",
            transformOrigin: "left center",
            color: focused ? "#3b82f6" : "rgba(255,255,255,0.4)",
            fontSize: 14,
            pointerEvents: "none",
            transition: "all 0.2s ease",
            background: "rgba(4,9,27,1)",
            padding: "0 4px",
            borderRadius: 4,
          }}
        >
          {label}
        </label>
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            padding: `16px 14px 14px ${Icon ? "44px" : "14px"}`,
            background: "transparent",
            border: "none",
            outline: "none",
            color: "white",
            fontSize: 15,
            fontFamily: "'DM Sans', sans-serif",
            paddingRight: type === "password" ? 44 : 14,
          }}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              padding: 4,
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#3b82f6")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
            }
          >
            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        )}
      </div>
      {error && (
        <p
          style={{
            color: "#f87171",
            fontSize: 12,
            marginTop: 4,
            paddingLeft: 4,
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
};

export default FloatingInput;
