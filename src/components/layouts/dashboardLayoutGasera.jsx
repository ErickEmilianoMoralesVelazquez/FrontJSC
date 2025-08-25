import SidebarGasera from "../common/sidebarGasera";
import { Outlet } from "react-router-dom";
import React from "react";

export default function DashboardLayout() {
  return (
    <div className="flex w-full overflow-x-hidden">
      <SidebarGasera />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Navbar con fondo de imagen */}
        <div
          className="w-full h-26 bg-cover bg-center"
          style={{
            backgroundImage: "url('/logos-nav.png')",
            backgroundColor: "#3c3d3f",
          }}
        />

        {/* Contenido principal con fondo de imagen */}
        <main
          className="flex-1 bg-cover bg-no-repeat bg-center px-4 py-6"
          style={{
            backgroundImage: "url('/background-jsc-2c.webp')",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
