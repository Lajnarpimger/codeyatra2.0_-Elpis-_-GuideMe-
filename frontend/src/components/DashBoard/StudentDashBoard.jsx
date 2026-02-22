import { Award, BookOpen, Check, TrendingUp } from "lucide-react";
import React from "react";
import ScrollReveal from "../UI/ScrollReveal";
import GlowCard from "../UI/GlowCard";
import ProgressBar from "../UI/ProgressBar";

const StudentDashBoard = ({ user }) => {
  const courses = [
    {
      title: "Advanced Mathematics",
      progress: 72,
      instructor: "Dr. Chen",
      color: "#3b82f6",
    },
    {
      title: "Organic Chemistry",
      progress: 45,
      instructor: "Prof. Santos",
      color: "#a78bfa",
    },
    {
      title: "World Literature",
      progress: 88,
      instructor: "Dr. Mills",
      color: "#22c55e",
    },
    {
      title: "Data Science Basics",
      progress: 31,
      instructor: "Prof. Kim",
      color: "#f59e0b",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "90px 2rem 60px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <ScrollReveal delay={0.1}>
          <div style={{ marginBottom: 48 }}>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "#3b82f6",
                fontSize: 14,
                fontWeight: 600,
                marginBottom: 8,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Good morning
            </p>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 40,
                fontWeight: 800,
                color: "white",
              }}
            >
              {user?.fullName} 👋
            </h1>
          </div>
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {[
            {
              label: "Enrolled Courses",
              value: "4",
              icon: BookOpen,
              color: "#3b82f6",
            },
            {
              label: "Completed",
              value: "12",
              icon: Check,
              color: "#22c55e",
            },
            {
              label: "Avg Progress",
              value: "59%",
              icon: TrendingUp,
              color: "#a78bfa",
            },
            {
              label: "Achievements",
              value: "8",
              icon: Award,
              color: "#f59e0b",
            },
          ].map(({ label, value, color, icon: Icon }, i) => (
            <ScrollReveal key={label} delay={i * 0.08} direction="up">
              <GlowCard
                style={{
                  padding: "22px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: `${color}18`,
                    border: `1px solid ${color}30`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={color} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 28,
                      fontWeight: 800,
                      color: "white",
                    }}
                  >
                    {value}
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                    }}
                  >
                    {label}
                  </div>
                </div>
              </GlowCard>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.3}>
          <GlowCard style={{ padding: 28 }}>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                fontWeight: 700,
                color: "white",
                marginBottom: 24,
              }}
            >
              My Courses
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {courses.map(({ title, progress, instructor, color }, i) => (
                <ScrollReveal key={title} delay={i * 0.08}>
                  <div
                    style={{
                      padding: "20px 24px",
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(59,130,246,0.04)";
                      e.currentTarget.style.borderColor =
                        "rgba(59,130,246,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.02)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.05)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 14,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 16,
                            fontWeight: 600,
                            color: "white",
                          }}
                        >
                          {title}
                        </div>
                        <div
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            color: "rgba(255,255,255,0.35)",
                            marginTop: 3,
                          }}
                        >
                          {instructor}
                        </div>
                      </div>
                      <span
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontSize: 22,
                          fontWeight: 800,
                          color,
                        }}
                      >
                        {progress}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "rgba(255,255,255,0.05)",
                        overflow: "hidden",
                      }}
                    >
                      <ProgressBar progress={progress} color={color} />
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </GlowCard>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default StudentDashBoard;
