import React from "react";
import { useEffect } from "react";
import GridBag from "./GridBag";
import Particles from "./Particles";
import NavBar from "../NavBar/NavBar";

const Layout = ({ user, onLogout, children }) => {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    document.body.style.margin = "0";
    document.body.style.background = "#04091b";
    document.body.style.overflowX = "hidden";
  }, []);

  return (
    <div
      style={{
        background: "#04091b",
        minHeight: "100vh",
        color: "white",
        position: "relative",
      }}
    >
      <GridBag />
      <Particles />
      <NavBar user={user} onLogout={onLogout} />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
};

export default Layout;
