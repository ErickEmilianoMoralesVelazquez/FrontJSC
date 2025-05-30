import React, { useState } from "react";
import {
  FileText,
  DollarSign,
  ClipboardList,
  LogOut,
  Menu,
  User,
  Image
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const menuItems = [
  {
    label: "Revisión de pedidos",
    icon: <ClipboardList size={18} />,
    path: "/dashboard/superadmin",
  },
  {
    label: "Cotizaciones",
    icon: <FileText size={18} />,
    path: "/dashboard/superadmin/quotes",
  },
  {
    label: "Facturación/Remisión",
    icon: <DollarSign size={18} />,
    path: "/dashboard/superadmin/invoices",
  },
  {
    label: "Envios de pedidos",
    icon: <ClipboardList size={18} />,
    path: "/dashboard/superadmin/backorders",
  },
  {
    label: "Pagos",
    icon: <DollarSign size={18} />,
    path: "/dashboard/superadmin/payments",
  },
  {
    label: "Usuarios",
    icon: <User size={18} />,
    path: "/dashboard/superadmin/users",
  },
  {
    label: 'Carrusel',
    icon: <Image size={18} />,
    path: '/dashboard/superadmin/carousel',
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  return (
    <>
      {/* Botón hamburguesa para móvil */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white bg-[#3c3d3f]  p-2 rounded-md shadow-md"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-[#3c3d3f] text-white px-5 py-6 flex flex-col z-40 transition-transform duration-300 transform
        ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:static md:flex`}
      >
        <div className="flex flex-col justify-start h-full flex-1">
          <div className="flex justify-center w-full">
            <img
              src="/src/assets/images/LOGO.png"
              alt="Logo"
              className="w-30 mb-8"
            />
          </div>
          <nav className="flex flex-col gap-3">
            {menuItems.map((item, idx) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={idx}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                    isActive
                      ? "bg-white text-black font-semibold"
                      : "hover:bg-white/10 text-gray-200"
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Botón cerrar sesión siempre visible */}
        <div className="mt-6 md:mt-10">
          <button
            onClick={() => {
              handleLogout();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 text-sm text-white transition w-full"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
