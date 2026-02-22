import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingInput from "../UI/FloatingInput";
import {
  BookOpen,
  Check,
  Clock,
  GraduationCapIcon,
  Lock,
  User,
  UserPlus,
} from "lucide-react";
import GlowCard from "../UI/GlowCard";
import Toast from "../UI/Toast";
import AuthCard from "../UI/AuthCard";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../../store/slices/UserSlices";

const SignUpPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    role: "student",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSignup = async () => {
    if (!form.fullName || !form.email || !form.password || !form.role)
      return showToast("All fields are required", "error");
    if (form.password.length < 6)
      return showToast("Password must be at least 6 characters", "error");
    setLoading(true);
    // await new Promise((r) => setTimeout(r, 1500));
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/signup",
        form,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      console.log(res);
      setLoading(false);
      setSuccess(true);
      dispatch(addUser(res.data));
      showToast("Signup successful! Awaiting admin approval.");
    } catch (error) {
      setLoading(false);
      console.error(error);
      const msg =
        error?.response?.data?.message || "Somthing went wrong while signup";
      showToast(msg, "error");
    }
  };

  if (success)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <GlowCard
          style={{
            maxWidth: 420,
            width: "100%",
            padding: "56px 40px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, rgba(34,197,94,0.2), rgba(34,197,94,0.05))",
              border: "1px solid rgba(34,197,94,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              boxShadow: "0 0 30px rgba(34,197,94,0.2)",
            }}
          >
            <Check size={36} color="#22c55e" />
          </div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 800,
              color: "white",
              marginBottom: 12,
            }}
          >
            You're Registered!
          </h2>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Your account has been created and is pending admin approval. You'll
            be notified once reviewed.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              justifyContent: "center",
              color: "rgba(255,255,255,0.35)",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <Clock size={15} />
            Average approval: 2–4 hours
          </div>
          <button
            onClick={() => navigate("/login")}
            style={{
              marginTop: 32,
              padding: "13px 32px",
              borderRadius: 10,
              border: "1px solid rgba(59,130,246,0.3)",
              background: "transparent",
              color: "white",
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59,130,246,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            Go to Login
          </button>
        </GlowCard>
      </div>
    );

  return (
    <AuthCard
      title="Create Account"
      subtitle="Join EduPortal as a student or teacher"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <FloatingInput
          label="Full name"
          value={form.fullName}
          onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          icon={User}
        />
        <FloatingInput
          label="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          icon={User}
        />
        <FloatingInput
          label="Password (min 6 chars)"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          icon={Lock}
        />

        {/* Role Selector */}
        <div>
          <p
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 10,
            }}
          >
            I am a...
          </p>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
          >
            {["student", "teacher"].map((role) => (
              <button
                key={role}
                onClick={() => setForm({ ...form, role })}
                style={{
                  padding: "12px 16px",
                  borderRadius: 10,
                  cursor: "pointer",
                  border: `1px solid ${form.role === role ? "rgba(59,130,246,0.5)" : "rgba(255,255,255,0.08)"}`,
                  background:
                    form.role === role
                      ? "rgba(59,130,246,0.12)"
                      : "rgba(255,255,255,0.02)",
                  color:
                    form.role === role ? "#93c5fd" : "rgba(255,255,255,0.4)",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {role === "student" ? (
                  <GraduationCapIcon size={16} />
                ) : (
                  <BookOpen size={16} />
                )}
                {role}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSignup}
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px",
            borderRadius: 10,
            border: "none",
            background: loading
              ? "rgba(59,130,246,0.4)"
              : "linear-gradient(135deg, #1d4ed8, #3b82f6)",
            color: "white",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 0 30px rgba(59,130,246,0.25)",
            transition: "all 0.3s",
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {loading ? (
            <div
              style={{
                width: 18,
                height: 18,
                border: "2px solid rgba(255,255,255,0.3)",
                borderTopColor: "white",
                borderRadius: "50%",
                animation: "spin-slow 0.8s linear infinite",
              }}
            />
          ) : (
            <>
              <UserPlus size={17} /> Create Account
            </>
          )}
        </button>

        <div style={{ textAlign: "center" }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: "#3b82f6",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                padding: 0,
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Sign in
            </button>
          </span>
        </div>
      </div>
      {toast && <Toast message={toast.msg} type={toast.type} />}
    </AuthCard>
  );
};

export default SignUpPage;
