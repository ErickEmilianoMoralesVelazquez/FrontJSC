import React, { useState, useEffect } from "react";
import {
  Eye,
  Calendar,
  ClipboardCheck,
  Truck,
  Package,
  FileText,
  X,
  Send,
  Box,
  CheckCircle,
} from "lucide-react";
import { Dialog } from "@headlessui/react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";

export default function BackordersTable() {
  const [search, setSearch] = useState("");
  const [guiaInput, setGuiaInput] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [open, setOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [newShipment, setNewShipment] = useState({
    pedido_id: "",
    numero_guia: "",
    empresa_paqueteria: "",
    detalles: "",
  });

  useEffect(() => {
    fetchOrders();
    fetchShipments();
  }, []);

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_URL_BACKEND}shipments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al obtener envíos");

      const data = await response.json();
      setShipments(data);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      toast.error("Error al cargar los envíos");
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_URL_BACKEND}orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al obtener pedidos");

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar los pedidos");
    }
  };

  const handleStatusUpdate = async (envioId, nuevoEstado) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_URL_BACKEND}shipments/${envioId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      if (!res.ok) throw new Error("Error al actualizar el estado del envío");

      toast.success("Estado actualizado correctamente");
      fetchShipments(); // recargar lista de envíos
    } catch (error) {
      console.error("Error actualizando estado:", error);
      toast.error("No se pudo actualizar el estado");
    }
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${import.meta.env.VITE_URL_BACKEND}shipments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newShipment),
        }
      );

      if (!response.ok) throw new Error("Error al crear el envío");

      toast.success("Envío creado exitosamente");
      setIsCreateModalOpen(false);
      setNewShipment({
        pedido_id: "",
        numero_guia: "",
        empresa_paqueteria: "",
        detalles: "",
      });
      // Aquí podrías actualizar la lista de envíos
      fetchShipments();
    } catch (error) {
      console.log(newShipment)
      console.error("Error creating shipment:", error);
      toast.error("Error al crear el envío");
    }
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setNewShipment({
      pedido_id: "",
      numero_guia: "",
      empresa_paqueteria: "",
      detalles: "",
    });
  };

  const filtered = shipments.filter((item) => {
    const matchSearch =
      item.pedido_id.toString().toLowerCase().includes(search.toLowerCase()) ||
      item.empresa_paqueteria.toLowerCase().includes(search.toLowerCase());

    const matchGuia =
      guiaInput === "" ||
      item.numero_guia.toLowerCase().includes(guiaInput.toLowerCase());

    return matchSearch && matchGuia;
  });

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Envíos</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Package size={16} />
          Nuevo Envío
        </button>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar orden o repartidor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full"
        />
        <input
          type="text"
          placeholder="Filtrar por número de guía..."
          value={guiaInput}
          onChange={(e) => setGuiaInput(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full"
        />
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-2 text-sm text-gray-700">
          <thead className="text-xs uppercase text-gray-500">
            <tr>
              <th className="text-left px-4 py-2">ID PEDIDO</th>
              <th className="text-left px-4 py-2">ESTADO</th>
              <th className="text-left px-4 py-2">FECHA CREACIÓN</th>
              <th className="text-left px-4 py-2">FECHA ENVÍO</th>
              <th className="text-left px-4 py-2">FECHA LÍMITE</th>
              <th className="text-left px-4 py-2">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((envio) => (
              <tr
                key={envio.id}
                className="bg-gray-50 hover:bg-gray-100 transition rounded-lg"
              >
                <td className="px-4 py-2 font-medium">#{envio.pedido_id}</td>
                <td className="px-4 py-2">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      envio.estado === "pendiente"
                        ? "bg-yellow-100 text-yellow-700"
                        : envio.estado === "en_proceso"
                        ? "bg-blue-100 text-blue-700"
                        : envio.estado === "enviado"
                        ? "bg-orange-100 text-orange-700"
                        : envio.estado === "entregado"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {envio.estado.replace("_", " ").toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {new Date(envio.fecha_creacion).toLocaleDateString("es-MX")}
                </td>
                <td className="px-4 py-2">
                  {envio.fecha_envio
                    ? new Date(envio.fecha_envio).toLocaleDateString("es-MX")
                    : "No enviado"}
                </td>
                <td className="px-4 py-2">
                  {envio.fecha_limite
                    ? new Date(envio.fecha_limite).toLocaleDateString("es-MX")
                    : "Sin límite"}
                </td>
                <td className="px-4 py-2 flex items-center gap-2 relative">
                  <div className="group relative">
                    <Eye
                      className="w-4 h-4 text-blue-500 cursor-pointer hover:scale-110 transition"
                      onClick={() => openDetails(envio)}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                      Ver detalles del envío
                    </div>
                  </div>

                  {envio.estado === "en_proceso" && (
                    <div className="group relative">
                      <Send
                        className="w-4 h-4 text-yellow-500 cursor-pointer hover:scale-110 transition"
                        onClick={() => handleStatusUpdate(envio.id, "enviado")}
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                        Marcar pedido como enviado
                      </div>
                    </div>
                  )}

                  {envio.estado === "enviado" && (
                    <div className="group relative">
                      <CheckCircle
                        className="w-4 h-4 text-green-500 cursor-pointer hover:scale-110 transition"
                        onClick={() =>
                          handleStatusUpdate(envio.id, "entregado")
                        }
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap">
                        Marcar pedido como entregado
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de detalles con diseño tipo ModalDetails */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        className="relative z-50"
      >
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-100 relative"
                >
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="text-red-600" size={24} />
                        Detalle de Envio
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Información completa del pedido en envio
                      </p>
                    </div>
                    <button
                      onClick={() => setOpen(false)}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Cerrar modal"
                    >
                      <X
                        className="text-gray-500 hover:text-gray-700"
                        size={20}
                      />
                    </button>
                  </div>

                  {/* Contenido del modal */}
                  <div className="space-y-4 text-sm text-gray-700">
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <FileText size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Orden de compra</p>
                        <p className="font-medium">{selectedOrder?.orden}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Entrega estimada
                        </p>
                        <p className="font-medium">{selectedOrder?.entrega}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <ClipboardCheck size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Fecha solicitada
                        </p>
                        <p className="font-medium">
                          {selectedOrder?.solicitud}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Número de guía</p>
                        <p className="font-medium">{selectedOrder?.guia}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <UserIcon />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Repartidor</p>
                        <p className="font-medium">
                          {selectedOrder?.repartidor}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-100 text-right">
                    <button
                      onClick={() => setOpen(false)}
                      className="cursor-pointer px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Cerrar
                    </button>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </Dialog>

      {/* Modal para crear nuevo envío */}
      <Dialog
        open={isCreateModalOpen}
        onClose={handleCloseModal}
        className="relative z-50"
      >
        <AnimatePresence>
          {isCreateModalOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <div className="fixed inset-0 flex items-center justify-center p-4">
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-100 relative"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Truck className="text-red-600" size={24} />
                        Nuevo Envío
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Ingresa los datos del nuevo envío
                      </p>
                    </div>
                    <button
                      onClick={handleCloseModal}
                      className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X
                        className="text-gray-500 hover:text-gray-700"
                        size={20}
                      />
                    </button>
                  </div>
                  <form onSubmit={handleCreateShipment} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <Package size={18} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500">
                          Pedido
                        </label>
                        <select
                          value={newShipment.pedido_id}
                          onChange={(e) =>
                            setNewShipment({
                              ...newShipment,
                              pedido_id: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1 border-b border-gray-300 border-0 bg-transparent focus:border-red-500 focus:outline-none text-sm font-medium"
                          required
                        >
                          <option value="">Selecciona un pedido</option>
                          {orders.map((order) => (
                            <option key={order.id} value={order.id}>
                              Pedido #{order.id} - {order.usuario?.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <FileText size={18} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500">
                          Número de Guía
                        </label>
                        <input
                          type="text"
                          value={newShipment.numero_guia}
                          onChange={(e) =>
                            setNewShipment({
                              ...newShipment,
                              numero_guia: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1 border-b border-gray-300 border-0 bg-transparent focus:border-red-500 focus:outline-none text-sm font-medium"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <Truck size={18} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500">
                          Empresa de Paquetería
                        </label>
                        <input
                          type="text"
                          value={newShipment.empresa_paqueteria}
                          onChange={(e) =>
                            setNewShipment({
                              ...newShipment,
                              empresa_paqueteria: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1 border-b border-gray-300 border-0 bg-transparent focus:border-red-500 focus:outline-none text-sm font-medium"
                          required
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="p-2 bg-red-100 rounded-full text-red-600">
                        <ClipboardCheck size={18} />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-medium text-gray-500">
                          Detalles
                        </label>
                        <textarea
                          value={newShipment.detalles}
                          onChange={(e) =>
                            setNewShipment({
                              ...newShipment,
                              detalles: e.target.value,
                            })
                          }
                          className="w-full px-3 py-1 border-b border-gray-300 border-0 bg-transparent focus:border-red-500 focus:outline-none text-sm font-medium resize-none"
                          rows="2"
                        />
                      </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3"
                    >
                      <button
                        type="button"
                        onClick={handleCloseModal}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                      >
                        Cancelar
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Crear Envío
                      </button>
                    </motion.div>
                  </form>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </Dialog>
    </div>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5.121 17.804A9.003 9.003 0 0112 15c2.003 0 3.847.66 5.273 1.766M15 11a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
