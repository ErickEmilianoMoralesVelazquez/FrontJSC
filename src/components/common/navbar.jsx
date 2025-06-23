import React, { useState } from "react";
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(null);

  const toggleSubmenu = (name) => {
    setSubmenuOpen(submenuOpen === name ? null : name);
  };

  return (
    <nav className="bg-[#111719] text-white w-full shadow-sm z-50">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-2 py-3 relative">
        {/* Logo + Título */}
        <div className="flex items-center gap-x-4 lg:justify-start justify-center w-full lg:w-auto">
          <img
            src="/Logo.svg"
            alt="Jorges Lubricantes"
            className="h-12 object-contain flex-shrink-0"
          />
        </div>

        {/* Navegación desktop */}
        <ul className="hidden lg:flex items-center gap-x-6 text-sm">
          <li>
            <Link to="#" className="hover:text-blue-500">
              Manual
            </Link>
          </li>
          <li>
            <Link to="#" className="hover:text-blue-500">
              Capacitaciones
            </Link>
          </li>
          <li className="relative">
            <button
              onClick={() => toggleSubmenu("terminos")}
              className="flex items-center gap-1 hover:text-blue-500"
            >
              Términos y Condiciones <ChevronDownIcon className="w-4 h-4" />
            </button>
            {submenuOpen === "terminos" && (
              <div className="absolute left-0 mt-2 bg-white text-black rounded-md shadow-md px-4 py-2 z-50">
                <Link to="#" className="block px-2 py-1 hover:text-blue-600">
                  Pólizas
                </Link>
              </div>
            )}
          </li>
          <li>
            <Link
              to="https://web.whatsapp.com/send?phone=7771681311&text=%C2%A1Hola"
              className="hover:text-blue-500"
            >
              Contacto
            </Link>
          </li>
        </ul>

        {/* Login desktop */}
        <div className="hidden lg:block">
          <Link
            to="/login"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
          >
            Iniciar sesión
          </Link>
        </div>

        {/* Botón menú móvil */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center p-2 text-sm text-gray-400 hover:bg-gray-700 rounded-lg"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {mobileMenuOpen && (
        <div className="px-4 pb-4 lg:hidden text-sm space-y-1">
          <Link to="#" className="block py-2 hover:text-blue-500">
            Manual
          </Link>
          <Link to="#" className="block py-2 hover:text-blue-500">
            Capacitaciones
          </Link>

          {/* Submenú Términos */}
          <div>
            <button
              onClick={() => toggleSubmenu("terminos")}
              className="w-full text-left flex items-center justify-between py-2 hover:text-blue-500"
            >
              Términos y Condiciones <ChevronDownIcon className="w-4 h-4" />
            </button>
            {submenuOpen === "terminos" && (
              <div className="pl-4">
                <Link to="#" className="block py-1 hover:text-blue-400">
                  Pólizas
                </Link>
              </div>
            )}
          </div>

          {/* Contacto */}
          <Link
            to="https://web.whatsapp.com/send?phone=7771681311&text=%C2%A1Hola"
            className="block py-2 hover:text-blue-500"
          >
            Contacto
          </Link>

          {/* Login móvil */}
          <Link
            to="/login"
            className="block bg-red-600 hover:bg-red-700 text-white text-center px-4 py-2 rounded-md mt-2"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </nav>
  );
}
