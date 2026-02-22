import React from "react";
import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/UI/Layout";
import HomePage from "../components/pages/HomePage";
import LoginPage from "../components/pages/LoginPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminDashboard from "../components/DashBoard/AdminDashboard";
import StudentDashBoard from "../components/DashBoard/StudentDashBoard";
import SignUpPage from "../components/pages/SignUpPage";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Toast from "../components/UI/Toast";
import { addUser, logout } from "../store/slices/UserSlices";
import { useEffect } from "react";
import TeacherDashboard from "../components/DashBoard/TeacherDashboard";
import TeacherCreateMcqs from "../components/MCQs/TeacherCreateMcqs";
import McqTest from "../components/MCQs/McqTest";
import TeacherViewReports from "../components/DashBoard/TeacherViewReports";

const Allroutes = () => {
  const [users, setUser] = useState(null);
  const user = useSelector((state) => state.user);
  console.log(user, "this is user");
  const [toast, setToast] = useState(null);
  const dispatch = useDispatch();
  const [loadingUser, setLoadingUser] = useState(true);

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        "http://localhost:3000/api/auth/logout",
        {},
        {
          withCredentials: true,
        },
      );
      console.log(res);
      dispatch(logout());
      setToast(res, "success");
    } catch (error) {
      console.error("Error in logout", error);
      setToast(error, "error");
    }
  };
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/getMe", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const resData = await res.json();
        console.log("This is res data", resData);
        dispatch(addUser(resData.data));
      } catch (error) {
        console.log(error, "error getting me");
        dispatch(logout());
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUser();
  }, []);
  return (
    // <Layout user={user} onLogout={handleLogout}>
    //   <Routes>
    //     <Route path="/" element={<HomePage />} />
    //     <Route
    //       path="/login"
    //       element={
    //         user ? (
    //           <Navigate
    //             to={user.role === "admin" ? "/admin" : "/dashboard"}
    //             replace
    //           />
    //         ) : (
    //           <LoginPage setUser={setUser} />
    //         )
    //       }
    //     />
    //     <Route
    //       path="/signup"
    //       element={
    //         user ? (
    //           <Navigate
    //             to={user.role === "admin" ? "/admin" : "/dashboard"}
    //             replace
    //           />
    //         ) : (
    //           <SignUpPage />
    //         )
    //       }
    //     />
    //     <Route
    //       path="/admin"
    //       element={
    //         <ProtectedRoute user={user} requiredRole="admin">
    //           <AdminDashboard user={user} />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route
    //       path="/dashboard"
    //       element={
    //         <ProtectedRoute user={user}>
    //           <StudentDashBoard user={user} />
    //         </ProtectedRoute>
    //       }
    //     />
    //     <Route path="*" element={<Navigate to="/" replace />} />
    //   </Routes>
    // </Layout>
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teacher"
          element={
            <ProtectedRoute requiredRole="teacher">
              <TeacherDashboard />
              //{" "}
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashBoard onLogout={handleLogout} />
              //{" "}
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/teacher/create-mcqs" element={<TeacherCreateMcqs />} />
        <Route path="/mcqs/test/:quizId" element={<McqTest />} />
        <Route path="/teacher/viewReports" element={<TeacherViewReports />} />
      </Routes>
    </Layout>
  );
};

export default Allroutes;
