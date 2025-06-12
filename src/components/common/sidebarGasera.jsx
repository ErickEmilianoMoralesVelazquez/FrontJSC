import React, { useState, useEffect } from "react";
import {
  FileText,
  ClipboardList,
  LogOut,
  Menu,
  UserCircle,
  Upload,
  X,
  Camera
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const menuItems = [
  {
    label: "Pedidos",
    icon: <ClipboardList size={18} />,
    path: "/dashboard/gasera/orders",
  },
  {
    label: "Cotizaciones",
    icon: <FileText size={18} />,
    path: "/dashboard/gasera/quotes",
  },
];

export default function SidebarGasera() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showPopover, setShowPopover] = useState(false);
  const [userName, setUserName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [profileImage, setProfileImage] = useState(() =>
    localStorage.getItem("profileImage") || "/src/assets/images/image.png"
  );
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${import.meta.env.VITE_URL_BACKEND}users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.nombre) {
            setUserName(data.nombre);
            setUserId(data.id);
            if (data.foto_perfil) {
              setProfileImage(data.foto_perfil);
              localStorage.setItem("profileImage", data.foto_perfil);
            }
          }
        })
        .catch((err) => {
          console.error("Error al obtener el usuario:", err);
        });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profileImage"); 
    navigate("/", { replace: true });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0] || e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setUploadedImage(file);
    } else {
      toast.error("Por favor selecciona una imagen válida");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!uploadedImage || !userId) {
      toast.error("Por favor selecciona una imagen y asegúrate de estar autenticado");
      return;
    }

    const formData = new FormData();
    formData.append("foto_perfil", uploadedImage);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_URL_BACKEND}users/${userId}/upload-profile-photo`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.url);
        localStorage.setItem("profileImage", data.url);
        setIsModalOpen(false);
        setUploadedImage(null);
        toast.success("Foto de perfil actualizada exitosamente");
      } else {
        throw new Error("Error al actualizar la foto de perfil");
      }
    } catch (error) {
      toast.error("Error al actualizar la foto de perfil");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e);
  };

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white bg-black p-2 rounded-md shadow-md"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <aside
        className={`fixed top-0 left-0 h-screen w-64 bg-black text-white px-5 py-6 flex flex-col justify-between z-40 transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:flex`}
      >
        <div className="flex-1 flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-center w-full relative group">
              <img
                src={profileImage}
                alt="Foto de perfil"
                className="w-25 h-25 mb-2 mt-2 rounded-full cursor-pointer transition-opacity group-hover:opacity-75 object-cover"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            </div>
            {userName && (
              <p className="text-center text-sm text-white mb-6 font-semibold">
                {userName}
              </p>
            )}
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

          <div className="flex flex-col gap-4 mt-10 relative">
            <Link to="https://web.whatsapp.com/send?phone=7771681311&text=%C2%A1Hola">
              <div className="relative">
                <button
                  type="button"
                  onMouseEnter={() =>
                    window.innerWidth >= 768 && setShowPopover(true)
                  }
                  onMouseLeave={() =>
                    window.innerWidth >= 768 && setShowPopover(false)
                  }
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:scale-[1.02] transition"
                >
                  <UserCircle size={18} />
                  Contacto
                </button>

                <div
                  className={`hidden md:block absolute left-full ml-4 top-1/2 -translate-y-1/2 w-64 bg-white text-gray-500 rounded-lg shadow-lg border border-gray-200 transition-all duration-200 ${
                    showPopover ? "opacity-100 visible" : "opacity-0 invisible"
                  }`}
                >
                  <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white transform rotate-45 border-l border-b border-gray-200"></div>

                  <div className="relative z-10 bg-white rounded-lg overflow-hidden">
                    <div className="px-3 py-2 bg-black border-b border-black">
                      <h3 className="font-semibold text-white">Asesor Jorges</h3>
                    </div>
                    <div className="px-3 py-2">
                      <p>
                        ¿Necesitas ayuda? Contáctanos para recibir asesoría
                        personalizada.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 text-sm text-red-400 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Modal para cambiar foto */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-100 relative"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Camera className="text-red-600" size={20} />
                    Cambiar foto de perfil
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Sube una nueva foto para tu perfil
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setUploadedImage(null);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="text-gray-500 hover:text-gray-700" size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <Upload size={16} className="text-red-600" />
                    Imagen
                  </label>

                  {!uploadedImage ? (
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                        isDragging ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Camera size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="font-medium text-gray-700">
                        Arrastra y suelta tu imagen aquí
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG o JPEG hasta 5MB
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={handleImageUpload}
                      />
                      <label
                        htmlFor="image-upload"
                        className="inline-block mt-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        Seleccionar imagen
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={URL.createObjectURL(uploadedImage)}
                            alt="Preview"
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-medium text-gray-900">
                              {uploadedImage.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setUploadedImage(null)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setUploadedImage(null);
                    }}
                    className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Subir foto
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
