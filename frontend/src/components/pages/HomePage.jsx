import React from "react";
import ScrollReveal from "../UI/ScrollReveal";
import GlowCard from "../UI/GlowCard";
import MagneticButton from "../UI/MagneticButton";
import {
  ArrowRight,
  Award,
  BookOpen,
  GraduationCap,
  Icon,
  LogIn,
  Shield,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import SplitText from "../UI/SplitText";

const HomePage = () => {
  const navigate = useNavigate();
  const heroRef = useRef();

  const stats = [
    { value: "12K+", label: "Students", icon: Users },
    { value: "98%", label: "Approval Rate", icon: Award },
    { value: "500+", label: "Courses", icon: BookOpen },
    { value: "4.9★", label: "Rating", icon: Star },
  ];

  const features = [
    {
      icon: Shield,
      title: "Secure Access Control",
      desc: "Admin-controlled approval system ensures quality and safety for every user on the platform.",
    },
    {
      icon: GraduationCap,
      title: "Personalized Learning",
      desc: "Students and teachers get tailored dashboards built around their unique educational journey.",
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      desc: "Real-time updates on enrollment status, course changes, and admin approvals.",
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      desc: "Comprehensive analytics to monitor learning progress and teaching effectiveness.",
    },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Hero */}
      <section
        ref={heroRef}
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "120px 2rem 80px",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(29,78,216,0.2) 0%, transparent 70%)",
          position: "relative",
        }}
      >
        <div
          style={{
            textAlign: "center",
            maxWidth: 780,
            position: "relative",
            zIndex: 1,
          }}
        >
          <ScrollReveal delay={0.1}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(59,130,246,0.1)",
                border: "1px solid rgba(59,130,246,0.25)",
                borderRadius: 100,
                padding: "6px 16px",
                marginBottom: 32,
                color: "#93c5fd",
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#3b82f6",
                  animation: "pulse-ring 2s infinite",
                }}
              />
              Now accepting enrollments for Spring 2026
            </div>
          </ScrollReveal>

          <h1
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(48px, 8vw, 88px)",
              fontWeight: 800,
              lineHeight: 1.05,
              color: "white",
              margin: "0 0 24px",
            }}
          >
            <SplitText text="Learn Without" delay={0.3} stagger={0.03} />
            <br />
            <span style={{ color: "#3b82f6", display: "block" }}>
              <SplitText text="Limits." delay={0.7} stagger={0.05} />
            </span>
          </h1>

          <ScrollReveal delay={0.9}>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 18,
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.55)",
                marginBottom: 48,
                maxWidth: 560,
                margin: "0 auto 48px",
              }}
            >
              A curated educational platform where students and teachers connect
              in a secure, admin-vetted environment built for serious learning.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={1.1}>
            <div
              style={{
                display: "flex",
                gap: 16,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <MagneticButton
                onClick={() => navigate("/signup")}
                className=""
                style={{
                  padding: "14px 32px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                  border: "none",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: "0 0 40px rgba(59,130,246,0.4)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "box-shadow 0.3s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 60px rgba(59,130,246,0.6)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.boxShadow =
                    "0 0 40px rgba(59,130,246,0.4)")
                }
              >
                <div className="flex gap-2 items-center">
                  {" "}
                  Get Started <ArrowRight size={17} />
                </div>
              </MagneticButton>
              <MagneticButton
                onClick={() => navigate("/login")}
                style={{
                  padding: "14px 32px",
                  borderRadius: 12,
                  background: "transparent",
                  border: "1px solid rgba(59,130,246,0.3)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 15,
                  fontWeight: 600,
                  fontFamily: "'DM Sans', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(59,130,246,0.1)";
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                }}
              >
                <div className="flex gap-2 items-center">
                  <LogIn size={17} /> Sign In
                </div>
              </MagneticButton>
            </div>
          </ScrollReveal>
        </div>

        {/* Decorative ring */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            border: "1px solid rgba(59,130,246,0.06)",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "spin-slow 30s linear infinite",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 900,
            height: 900,
            border: "1px solid rgba(59,130,246,0.03)",
            borderRadius: "50%",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "spin-slow 50s linear infinite reverse",
            pointerEvents: "none",
          }}
        />
      </section>

      {/* Stats */}
      <section
        style={{
          padding: "80px 2rem",
          background: "rgba(59,130,246,0.03)",
          borderTop: "1px solid rgba(59,130,246,0.08)",
          borderBottom: "1px solid rgba(59,130,246,0.08)",
        }}
      >
        <div
          style={{
            maxWidth: 900,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 24,
          }}
        >
          {stats.map(({ value, label, icon: Icon }, i) => (
            <ScrollReveal key={label} delay={i * 0.1} direction="up">
              <div style={{ textAlign: "center", padding: "24px 16px" }}>
                <Icon size={28} color="#3b82f6" style={{ marginBottom: 12 }} />
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 42,
                    fontWeight: 800,
                    color: "white",
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 14,
                    color: "rgba(255,255,255,0.45)",
                    marginTop: 6,
                  }}
                >
                  {label}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "100px 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <ScrollReveal direction="up">
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(32px, 5vw, 52px)",
                fontWeight: 800,
                color: "white",
                textAlign: "center",
                marginBottom: 60,
              }}
            >
              Built for <span style={{ color: "#3b82f6" }}>Excellence</span>
            </h2>
          </ScrollReveal>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 24,
            }}
          >
            {features.map(({ icon: Icon, title, desc }, i) => (
              <ScrollReveal key={title} delay={i * 0.1} direction="up">
                <GlowCard style={{ padding: 32, height: "100%" }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background:
                        "linear-gradient(135deg, rgba(29,78,216,0.3), rgba(59,130,246,0.1))",
                      border: "1px solid rgba(59,130,246,0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 20,
                    }}
                  >
                    <Icon size={24} color="#3b82f6" />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 12,
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 14,
                      color: "rgba(255,255,255,0.45)",
                      lineHeight: 1.7,
                    }}
                  >
                    {desc}
                  </p>
                </GlowCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "100px 2rem", textAlign: "center" }}>
        <ScrollReveal>
          <GlowCard
            style={{
              maxWidth: 680,
              margin: "0 auto",
              padding: "64px 48px",
              background:
                "linear-gradient(135deg, rgba(29,78,216,0.15), rgba(8,15,40,0.9))",
            }}
          >
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 40,
                fontWeight: 800,
                color: "white",
                marginBottom: 16,
              }}
            >
              Ready to Begin?
            </h2>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "rgba(255,255,255,0.5)",
                marginBottom: 36,
                fontSize: 16,
              }}
            >
              Join thousands of learners already on the platform.
            </p>
            <MagneticButton
              onClick={() => navigate("/signup")}
              style={{
                padding: "16px 40px",
                borderRadius: 12,
                background: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 600,
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: "0 0 40px rgba(59,130,246,0.35)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Create Account <ArrowRight size={18} />
            </MagneticButton>
          </GlowCard>
        </ScrollReveal>
      </section>
    </div>
  );
};

export default HomePage;
