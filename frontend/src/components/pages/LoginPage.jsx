import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FloatingInput from "../UI/FloatingInput";
import { Lock, LogIn, User } from "lucide-react";
import Toast from "../UI/Toast";
import AuthCard from "../UI/AuthCard";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../../store/slices/UserSlices";

const LoginPage = ({ setUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const dispatch = useDispatch();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogin = async () => {
    if (!form.email || !form.password)
      return showToast("All fields are required", "error");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    try {
      const resData = await axios.post(
        "http://localhost:3000/api/auth/login",
        form,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        },
      );
      const userData = resData.data.data || resData.data;

      dispatch(addUser(userData));

      if (userData.role === "admin") navigate("/admin");
      else if (userData.role === "teacher") navigate("/teacher");
      else navigate("/dashboard");
    } catch (error) {
      setLoading(true);
      const msg =
        error?.response?.data?.message || "Somthing went wrong while login";
      showToast(msg, "error");
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Welcome Back" subtitle="Sign in to your EduPortal account">
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FloatingInput
          label="Email address"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          icon={User}
        />
        <FloatingInput
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          icon={Lock}
        />
        <button
          onClick={handleLogin}
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
            boxShadow: loading ? "none" : "0 0 30px rgba(59,130,246,0.3)",
            transition: "all 0.3s",
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            if (!loading)
              e.currentTarget.style.boxShadow = "0 0 50px rgba(59,130,246,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = loading
              ? "none"
              : "0 0 30px rgba(59,130,246,0.3)";
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
              <LogIn size={17} /> Sign In
            </>
          )}
        </button>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
            }}
          >
            No account?{" "}
            <button
              onClick={() => navigate("/signup")}
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
              Sign up free
            </button>
          </span>
        </div>

        <div style={{ textAlign: "center", marginTop: 4 }}>
          <span
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
            }}
          >
            Demo: admin@demo.com / any password for admin access
          </span>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </AuthCard>
  );
};

export default LoginPage;
