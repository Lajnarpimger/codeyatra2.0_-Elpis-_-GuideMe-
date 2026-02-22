import {
  Bell,
  BookOpen,
  ChevronRight,
  GraduationCap,
  GraduationCapIcon,
  LogIn,
  LogOut,
  Settings,
  Shield,
  User,
  UserPlus,
} from "lucide-react";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

const NavBar = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  // const user = useSelector((state) => state.user);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const navLinks = user
    ? user.role === "admin"
      ? [{ label: "Dashboard", path: "/admin", icon: Shield }]
      : [{ label: "Dashboard", path: "/dashboard", icon: BookOpen }]
    : [
        { label: "Home", path: "/", icon: null },
        { label: "Login", path: "/login", icon: LogIn },
        { label: "Sign Up", path: "/signup", icon: UserPlus },
      ];
  console.log("THis is current user", user);
  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.4s ease",
        background: scrolled ? "rgba(4,9,27,0.92)" : "transparent",
        backdropFilter: scrolled ? "blur(20px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(59,130,246,0.15)"
          : "1px solid transparent",
        padding: "0 2rem",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 72,
        }}
      >
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(59,130,246,0.4)",
            }}
          >
            <GraduationCapIcon size={20} color="white" />
          </div>
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: 22,
              fontWeight: 700,
              color: "white",
              letterSpacing: "-0.5px",
            }}
          >
            Edu<span style={{ color: "#3b82f6" }}>Portal</span>
          </span>
        </button>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {navLinks.map(({ label, path, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 18px",
                  borderRadius: 8,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: isActive ? "white" : "rgba(255,255,255,0.7)",
                  background: isActive ? "rgba(59,130,246,0.2)" : "transparent",
                  borderWidth: 1,
                  borderStyle: "solid",
                  borderColor: isActive
                    ? "rgba(59,130,246,0.4)"
                    : "transparent",
                  transition: "all 0.2s ease",
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                    e.currentTarget.style.color = "white";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                  }
                }}
              >
                {Icon && <Icon size={15} />}
                {label}
              </button>
            );
          })}

          {user && (
            <>
              {/* Notification Bell */}
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  position: "relative",
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.7)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(59,130,246,0.15)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                }}
              >
                <Bell size={17} />
                <span
                  style={{
                    position: "absolute",
                    top: 7,
                    right: 7,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "#3b82f6",
                    boxShadow: "0 0 6px #3b82f6",
                    animation: "pulse-ring 2s infinite",
                  }}
                />
              </button>

              {/* User Avatar */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 12px 6px 6px",
                    borderRadius: 10,
                    border: "1px solid rgba(59,130,246,0.2)",
                    background: "rgba(59,130,246,0.08)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(59,130,246,0.15)";
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)";
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 8,
                      background: "linear-gradient(135deg, #1d4ed8, #60a5fa)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "white",
                    }}
                  >
                    {user?.fullName?.trim()?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 13,
                      color: "white",
                      fontWeight: 500,
                    }}
                  >
                    {user.fullName}
                  </span>
                  <ChevronRight
                    size={14}
                    color="rgba(255,255,255,0.5)"
                    style={{
                      transform: menuOpen ? "rotate(90deg)" : "rotate(0)",
                      transition: "transform 0.2s",
                    }}
                  />
                </button>

                {menuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      background: "rgba(8,15,40,0.97)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(59,130,246,0.2)",
                      borderRadius: 12,
                      padding: 8,
                      minWidth: 180,
                      boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                      animation: "slide-in-right 0.2s ease",
                    }}
                  >
                    {[
                      { icon: User, label: "Profile" },
                      { icon: Settings, label: "Settings" },
                    ].map(({ icon: Icon, label }) => (
                      <button
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          width: "100%",
                          padding: "9px 12px",
                          borderRadius: 8,
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          color: "rgba(255,255,255,0.7)",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 500,
                          transition: "all 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(59,130,246,0.15)";
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                        }}
                      >
                        <Icon size={15} />
                        {label}
                      </button>
                    ))}
                    <div
                      style={{
                        height: 1,
                        background: "rgba(59,130,246,0.15)",
                        margin: "4px 0",
                      }}
                    />
                    <button
                      onClick={() => {
                        onLogout();
                        setMenuOpen(false);
                        navigate("/");
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        width: "100%",
                        padding: "9px 12px",
                        borderRadius: 8,
                        border: "none",
                        background: "transparent",
                        cursor: "pointer",
                        color: "#f87171",
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(248,113,113,0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
