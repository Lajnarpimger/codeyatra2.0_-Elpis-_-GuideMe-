import { BookOpen, Check, Clock, GraduationCap, Star } from "lucide-react";
import React from "react";
import { useState } from "react";
import Toast from "../UI/Toast";
import ScrollReveal from "../UI/ScrollReveal";
import GlowCard from "../UI/GlowCard";
import { useEffect } from "react";
import axios from "axios";

const AdminDashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingUsers, setPendingUsers] = useState([
    // {
    //   _id: "1",
    //   fullName: "Alex Chen",
    //   email: "alex@edu.com",
    //   role: "student",
    //   createdAt: "2026-02-18",
    // },
    // {
    //   _id: "2",
    //   fullName: "Maria Santos",
    //   email: "maria@edu.com",
    //   role: "teacher",
    //   createdAt: "2026-02-19",
    // },
    // {
    //   _id: "3",
    //   fullName: "James Kirk",
    //   email: "james@edu.com",
    //   role: "student",
    //   createdAt: "2026-02-20",
    // },
    // {
    //   _id: "4",
    //   fullName: "Priya Sharma",
    //   email: "priya@edu.com",
    //   role: "teacher",
    //   createdAt: "2026-02-21",
    // },
  ]);
  const [approving, setApproving] = useState(null);
  const [toast, setToast] = useState(null);
  // const [pendingUser, setPendingUser] = useState([]);
  const [totalStd, setTotalStds] = useState(0);
  const [totalTechers, setTotalTeachers] = useState(0);
  const [stats, setStats] = useState([]);

  const fetchDashboardData = async () => {
    try {
      const [pendingRes, countRes] = await Promise.all([
        axios.get("http://localhost:3000/api/admin/pending-users", {
          withCredentials: true,
        }),
        axios.get("http://localhost:3000/api/admin/total-counts", {
          withCredentials: true,
        }),
      ]);

      setPendingUsers(pendingRes.data);
      setTotalStds(
        Number(countRes.data.approvedStds) + Number(countRes.data.pendingStds),
      );
      setTotalTeachers(countRes.data.totalTeacher);

      setStats([
        {
          label: "Pending Approvals",
          value: pendingRes.data.length,
          icon: Clock,
          color: "#f59e0b",
        },
        {
          label: "Total Students",
          value:
            Number(countRes.data.approvedStds) +
            Number(countRes.data.pendingStds),
          icon: GraduationCap,
          color: "#3b82f6",
        },
        {
          label: "Active Teachers",
          value: countRes.data.totalTeacher,
          icon: BookOpen,
          color: "#22c55e",
        },
      ]);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  //   const handleApprove = async (id) => {
  //       setApproving(id);
  //     setPendingUsers((u) => u.filter((x) => x._id !== id));
  //     setApproving(null);
  //     showToast("User approved successfully!");
  //   };
  const handleApprove = async (id) => {
    try {
      setApproving(id);
      console.log("This is id", id);
      await axios.put(
        `http://localhost:3000/api/admin/approve/${id}`,
        {},
        { withCredentials: true },
      );

      await new Promise((r) => setTimeout(r, 800));
      // remove user from pending list
      setPendingUsers((prev) => prev.filter((u) => u._id !== id));
      showToast("User approved successfully!");
      fetchDashboardData();
    } catch (err) {
      console.error(err, "From approve");
      showToast("Failed to approve user", "error");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(
        `http://localhost:3000/api/admin/reject/${id}`,
        {},
        { withCredentials: true },
      );
      await new Promise((r) => setTimeout(r, 800));
      setPendingUsers((prev) => prev.filter((u) => u._id !== id));
      showToast("User rejected", "error");
      fetchDashboardData();
    } catch (err) {
      console.error("From Reject", err);
      showToast("Failed to reject user", "error");
    }
  };

  //   const stats = [
  //     {
  //       label: "Pending Approvals",
  //       value: pendingUser.length,
  //       icon: Clock,
  //       color: "#f59e0b",
  //     },
  //     {
  //       label: "Total Students",
  //       value: 1248,
  //       icon: GraduationCap,
  //       color: "#3b82f6",
  //     },
  //     {
  //       label: "Active Teachers",
  //       value: 84,
  //       icon: BookOpen,
  //       color: "#22c55e",
  //     },
  //     { label: "Courses Live", value: 312, icon: Star, color: "#a78bfa" },
  //   ];
  //   useEffect(() => {
  //     const fetchPendingUser = async () => {
  //       try {
  //         const res = await axios.get(
  //           "http://localhost:3000/api/admin/pending-users",
  //           {
  //             headers: { "Content-Type": "application/json" },
  //             withCredentials: true,
  //           },
  //         );
  //         const resCount = await axios.get(
  //           "http://localhost:3000/api/admin/total-counts",
  //           {
  //             headers: { "Content-Type": "application/json" },
  //             withCredentials: true,
  //           },
  //         );
  //         console.log("Counting", resCount.data);
  //         console.log("Pending users", res.data);
  //         setPendingUser(res?.data || []);
  //         setTotalStds(
  //           Number(resCount.data.approvedStds) +
  //             Number(resCount.data.pendingStds),
  //         );
  //         setTotalTeachers(resCount.data.totalTeacher);
  //       } catch (error) {
  //         console.log(error, "for pending users");
  //       }
  //     };
  //     fetchPendingUser();
  //   }, []);

  useEffect(() => {
    // const fetchDashboardData = async () => {
    //   try {
    //     const [pendingRes, countRes] = await Promise.all([
    //       axios.get("http://localhost:3000/api/admin/pending-users", {
    //         withCredentials: true,
    //       }),
    //       axios.get("http://localhost:3000/api/admin/total-counts", {
    //         withCredentials: true,
    //       }),
    //     ]);

    //     setPendingUsers(pendingRes.data);
    //     setTotalStds(
    //       Number(countRes.data.approvedStds) +
    //         Number(countRes.data.pendingStds),
    //     );
    //     setTotalTeachers(countRes.data.totalTeacher);

    //     setStats([
    //       {
    //         label: "Pending Approvals",
    //         value: pendingRes.data.length,
    //         icon: Clock,
    //         color: "#f59e0b",
    //       },
    //       {
    //         label: "Total Students",
    //         value:
    //           Number(countRes.data.approvedStds) +
    //           Number(countRes.data.pendingStds),
    //         icon: GraduationCap,
    //         color: "#3b82f6",
    //       },
    //       {
    //         label: "Active Teachers",
    //         value: countRes.data.totalTeacher,
    //         icon: BookOpen,
    //         color: "#22c55e",
    //       },
    //     ]);
    //   } catch (err) {
    //     console.error("Dashboard fetch error:", err);
    //   }
    // };
    fetchDashboardData();
  }, []);

  return (
    <div
      style={{ minHeight: "100vh", paddingTop: 90, padding: "90px 2rem 60px" }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <ScrollReveal delay={0.1}>
          <div style={{ marginBottom: 40 }}>
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 36,
                fontWeight: 800,
                color: "white",
                marginBottom: 8,
              }}
            >
              Admin <span style={{ color: "#3b82f6" }}>Dashboard</span>
            </h1>
            <p
              style={{
                fontFamily: "'DM Sans', sans-serif",
                color: "rgba(255,255,255,0.4)",
                fontSize: 15,
              }}
            >
              Manage platform users and approvals
            </p>
          </div>
        </ScrollReveal>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
            marginBottom: 40,
          }}
        >
          {stats.map(({ label, value, icon: Icon, color }, i) => (
            <ScrollReveal key={label} delay={i * 0.08} direction="up">
              <GlowCard style={{ padding: "24px 20px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 13,
                        color: "rgba(255,255,255,0.4)",
                        marginBottom: 8,
                      }}
                    >
                      {label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 36,
                        fontWeight: 800,
                        color: "white",
                      }}
                    >
                      {value}
                    </div>
                  </div>
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
                    }}
                  >
                    <Icon size={20} color={color} />
                  </div>
                </div>
              </GlowCard>
            </ScrollReveal>
          ))}
        </div>

        {/* Pending Users */}
        <ScrollReveal delay={0.3}>
          <GlowCard style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "24px 28px",
                borderBottom: "1px solid rgba(59,130,246,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: "white",
                    marginBottom: 4,
                  }}
                >
                  Pending Approvals
                </h2>
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {pendingUsers.length} user
                  {pendingUsers.length !== 1 ? "s" : ""} awaiting review
                </p>
              </div>
              <div
                style={{
                  background: "rgba(245,158,11,0.12)",
                  border: "1px solid rgba(245,158,11,0.25)",
                  borderRadius: 8,
                  padding: "4px 12px",
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: 13,
                  color: "#f59e0b",
                  fontWeight: 600,
                }}
              >
                {pendingUsers.length} pending
              </div>
            </div>

            {pendingUsers.length === 0 ? (
              <div style={{ padding: "60px 28px", textAlign: "center" }}>
                <Check size={40} color="#22c55e" style={{ marginBottom: 16 }} />
                <p
                  style={{
                    fontFamily: "'DM Sans', sans-serif",
                    color: "rgba(255,255,255,0.4)",
                    fontSize: 16,
                  }}
                >
                  All caught up! No pending approvals.
                </p>
              </div>
            ) : (
              <div>
                {pendingUsers.map((u, i) => (
                  <div
                    key={u._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "20px 28px",
                      flexWrap: "wrap",
                      gap: 16,
                      borderBottom:
                        i < pendingUsers.length - 1
                          ? "1px solid rgba(255,255,255,0.04)"
                          : "none",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(59,130,246,0.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 16 }}
                    >
                      <div
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          background:
                            "linear-gradient(135deg, #1d4ed8, #3b82f6)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 18,
                          fontWeight: 700,
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {u.fullName[0]}
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 15,
                            fontWeight: 600,
                            color: "white",
                          }}
                        >
                          {u.fullName}
                        </div>
                        <div
                          style={{
                            fontFamily: "'DM Sans', sans-serif",
                            fontSize: 13,
                            color: "rgba(255,255,255,0.4)",
                            marginTop: 2,
                          }}
                        >
                          {u.email}
                        </div>
                      </div>
                      <span
                        style={{
                          background:
                            u.role === "teacher"
                              ? "rgba(167,139,250,0.12)"
                              : "rgba(59,130,246,0.12)",
                          border: `1px solid ${u.role === "teacher" ? "rgba(167,139,250,0.25)" : "rgba(59,130,246,0.25)"}`,
                          color: u.role === "teacher" ? "#a78bfa" : "#93c5fd",
                          borderRadius: 6,
                          padding: "3px 10px",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {u.role}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button
                        onClick={() => handleReject(u._id)}
                        style={{
                          padding: "9px 18px",
                          borderRadius: 8,
                          border: "1px solid rgba(248,113,113,0.25)",
                          background: "rgba(248,113,113,0.06)",
                          color: "#f87171",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(248,113,113,0.12)";
                          e.currentTarget.style.borderColor =
                            "rgba(248,113,113,0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(248,113,113,0.06)";
                          e.currentTarget.style.borderColor =
                            "rgba(248,113,113,0.25)";
                        }}
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleApprove(u._id)}
                        disabled={approving === u._id}
                        style={{
                          padding: "9px 18px",
                          borderRadius: 8,
                          border: "none",
                          background:
                            "linear-gradient(135deg, #15803d, #22c55e)",
                          color: "white",
                          cursor: "pointer",
                          fontFamily: "'DM Sans', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: "0 0 16px rgba(34,197,94,0.2)",
                          transition: "all 0.2s",
                          opacity: approving === u._id ? 0.7 : 1,
                        }}
                        onMouseEnter={(e) => {
                          if (approving !== u._id)
                            e.currentTarget.style.boxShadow =
                              "0 0 24px rgba(34,197,94,0.35)";
                        }}
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.boxShadow =
                            "0 0 16px rgba(34,197,94,0.2)")
                        }
                      >
                        {approving === u._id ? (
                          <div
                            style={{
                              width: 14,
                              height: 14,
                              border: "2px solid rgba(255,255,255,0.3)",
                              borderTopColor: "white",
                              borderRadius: "50%",
                              animation: "spin-slow 0.8s linear infinite",
                            }}
                          />
                        ) : (
                          <Check size={15} />
                        )}
                        Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlowCard>
        </ScrollReveal>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
};

export default AdminDashboard;
