import React, { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../src/index.css";

const MyLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      const res = await axios.post(`${import.meta.env.VITE_URL_BACKEND}auth/login`, {
        correo: email,
        contraseña: password,
      });

      const { token, user } = res.data;
      const rol = user.rol;

      // Guardar token
      localStorage.setItem("token", token);

      // Redirigir según rol
      if (rol === "admin") {
        navigate("/dashboard/superadmin");
      } else if (rol === "cliente") {
        navigate("/dashboard/gasera/orders");
      } else {
        setErrorMsg("Rol no reconocido.");
        console.error("Rol no reconocido:", rol);
      }
    } catch (error) {
      console.error(
        "Error al iniciar sesión:",
        error.response?.data || error.message
      );
      setErrorMsg("Correo o contraseña incorrectos.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-image flex items-center justify-center px-4 sm:px-6 md:px-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Hero */}
          <div className="flex-col items-start justify-center hidden md:flex">
            <div className="flex flex-row items-center justify-center text-white space-x-3 mb-18">
              <Link to="/">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Jorges – Servicios Corporativos Flotillas
                </h1>
              </Link>
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold text-white mt-4">
              Solicita, cotiza y recibe con eficiencia
            </h2>
            <p className="text-white font-medium mt-6 text-sm md:text-base max-w-xl">
              En Jorges, puedes generar pedidos personalizados de forma
              sencilla. Cada solicitud se convierte en una cotización que puedes
              aceptar o rechazar. Si es aprobada, gestionamos el envío para que
              recibas tu pedido sin complicaciones.
            </p>
          </div>

          {/* Formulario */}
          <div className="flex justify-center items-center w-full">
            <div className="flex flex-col w-full max-w-md bg-white rounded-lg p-4 md:p-8 shadow-lg">
              <div className="flex md:hidden flex-row items-center justify-center text-black space-x-3 mb-8">
                <h1 className="text-2xl text-center">Jorges Lubricantes</h1>
              </div>

              <h3 className="text-black text-lg">Bienvenido</h3>
              <h2 className="text-black font-semibold text-xl md:text-2xl mt-3">
                Inicia sesión con tu cuenta
              </h2>

              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <input
                  type="email"
                  name="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full px-4 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full px-4 py-2 text-sm text-gray-900 bg-gray-100 border border-gray-300 rounded-lg pr-10 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeClosed /> : <Eye />}
                  </button>
                </div>

                {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

                <button
                  type="submit"
                  className="w-full bg-red-700 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Inicar Sesión
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyLogin;
