import Sidebar from "../common/sidebar";
import { Outlet } from "react-router-dom";
import React from "react";

export default function DashboardLayout() {
  return (
    <div className="flex w-full min-h-screen overflow-x-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Navbar con fondo de imagen */}
        <div
          className="w-full h-26 bg-cover bg-center"
          style={{
            backgroundImage: "url('/src/assets/images/logos-nav.png')",
            backgroundColor: "#3c3d3f",
          }}
        />

        {/* Contenido principal con fondo de imagen */}
        <main
          className="flex-1 min-h-full bg-cover bg-no-repeat bg-center px-4 py-6"
          style={{
            backgroundImage: "url('/src/assets/images/bg-pedidos.png')",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
