import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import DashboardGaseraCards from "../dashboard/dashboardGaseraCards";
import ModalCreateOrder from "../modals/modalCreateOrder";
import ModalEditOrder from "../modals/modalEditOrder";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function OrdersGaseraTable() {
  const [orders, setOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const badgeColor = {
    green: "bg-green-100 text-green-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
  };
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_URL_BACKEND}orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (!res.ok) throw new Error("Error al obtener pedidos");
  
      const data = await res.json();
  
      const mappedOrders = data.map((order) => ({
        id: `#${order.id}`,
        fecha: new Date(order.fecha_creacion).toISOString().split("T")[0],
        total: "Por asignar",
        archivo_url: order.archivo_url,
        estatus: order.estado.charAt(0).toUpperCase() + order.estado.slice(1),
        color:
          order.estado === "aceptado"
            ? "green"
            : order.estado === "pendiente"
            ? "yellow"
            : "red",
      }));
  
      setOrders(mappedOrders);
    } catch (err) {
      console.error(err);
      toast.error("No se pudieron cargar los pedidos.");
    }
  };
  
  const handleAddOrder = async (pdfFile) => {
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("pedido_pdf", pdfFile);
  
      const res = await fetch(`${import.meta.env.VITE_URL_BACKEND}orders`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Error al crear pedido.");
        return;
      }
  
      const { order } = await res.json();
  
      const newOrder = {
        id: `#${order.id}`,
        fecha: new Date(order.fecha_creacion).toISOString().split("T")[0],
        total: "Por asignar",
        estatus: order.estado.charAt(0).toUpperCase() + order.estado.slice(1),
        color: "yellow",
      };
  
      setOrders((prev) => [...prev, newOrder]);
      setIsOpen(false);
      toast.success("Pedido creado correctamente.");
    } catch (error) {
      console.error("Error al subir pedido:", error);
      toast.error("Ocurrió un error al crear el pedido.");
    }
  };
  
  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      const orderId = confirmDeleteId.replace("#", "");
  
      const res = await fetch(`${import.meta.env.VITE_URL_BACKEND}orders/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Error al cancelar el pedido.");
      }
  
      toast.success("Pedido cancelado correctamente.");
      setOrders((prev) =>
        prev.map((o) =>
          o.id === confirmDeleteId ? { ...o, estatus: "Cancelado", color: "red" } : o
        )
      );
    } catch (error) {
      console.error("Error al cancelar pedido:", error);
      toast.error(error.message || "No se pudo cancelar el pedido.");
    } finally {
      setConfirmDeleteId(null);
    }
  };
  

  const handleEditOrder = (updatedOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? { ...updatedOrder } : o))
    );
    setIsEditOpen(false);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      order.id.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, orders]);

  const columns = [
    {
      name: "ID Pedido",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => row.fecha,
    },
    {
      name: "Total",
      selector: (row) =>
        isNaN(row.total) ? row.total : `$${parseFloat(row.total).toFixed(2)}`,
    },
    {
      name: "Estatus",
      cell: (row) => (
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            badgeColor[row.color]
          }`}
        >
          {row.estatus}
        </span>
      ),
    },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex items-center justify-start h-full gap-3">
          <Eye
            className="w-4 h-4 text-blue-500 cursor-pointer hover:scale-110 transition"
            title="Ver PDF"
            onClick={() => window.open(row.archivo_url, "_blank")}
          />

          <Pencil
            className="w-4 h-4 text-yellow-500 cursor-pointer hover:scale-110 transition"
            title="Editar pedido"
            onClick={() => {
              setSelectedOrder(row);
              setIsEditOpen(true);
            }}
          />
          <Trash2
            className="w-4 h-4 text-red-500 cursor-pointer hover:scale-110 transition"
            title="Eliminar pedido"
            onClick={() => setConfirmDeleteId(row.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <DashboardGaseraCards />
      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Revisión de pedidos</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setIsOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition"
            >
              + Crear pedido
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="Buscar pedido..."
          className="mb-4 w-full border border-gray-300 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <DataTable
          columns={columns}
          data={filteredOrders}
          pagination
          paginationComponentOptions={{
            rowsPerPageText: "Filas por página",
            rangeSeparatorText: "de",
          }}
          highlightOnHover
          responsive
          striped
        />
      </div>

      {/* Modales */}
      <ModalCreateOrder
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreate={handleAddOrder}
      />
      <ModalEditOrder
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSave={handleEditOrder}
        order={selectedOrder}
      />

      {/* Confirmación de eliminación */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-xl">
            <h3 className="text-lg font-semibold mb-4">¿Eliminar pedido?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta acción no se puede deshacer. ¿Deseas continuar?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}