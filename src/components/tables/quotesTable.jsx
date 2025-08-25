import React, { useEffect, useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import ModalSaveQuote from "../modals/modalSaveQuote";
import { FilePlus, Eye, FileCheck } from "lucide-react";
import { toast } from "react-toastify";

const badgeColors = {
  pendiente: "bg-yellow-100 text-yellow-700",
  aceptada: "bg-green-100 text-green-700",
  rechazada: "bg-red-100 text-red-700",
};

export default function QuotesTable() {
  const [quotes, setQuotes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const columns = [
    { name: "ID Cotización", selector: (row) => row.id, sortable: true },
    { name: "Cliente", selector: (row) => row.clienteNombre },
    { name: "Pedido", selector: (row) => row.pedidoId },
    {
      name: "Estado",
      cell: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            badgeColors[row.estado] || "bg-gray-100 text-gray-700"
          }`}
        >
          {row.estado}
        </span>
      ),
    },
    { name: "Fecha", selector: (row) => row.fecha },
    {
      name: "Acciones",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            className="px-2 py-1 text-xs font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
            onClick={() => window.open(row.archivo_url, "_blank")}
          >
            Ver cotización
          </button>
          {row.pdf_aceptacion_url ? (
            <button
              className="px-2 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600 transition-colors"
              onClick={() => window.open(row.pdf_aceptacion_url, "_blank")}
            >
              Ver aceptación
            </button>
          ) : (
            <button
              className="px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded cursor-not-allowed"
              disabled
            >
              Sin aceptación
            </button>
          )}
        </div>
      ),
    },
  ];

  useEffect(() => {
    fetchQuotes();
  }, []);

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_URL_BACKEND}quotations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Error al obtener cotizaciones");

      const data = await res.json();

      const mapped = data.map((quote) => ({
        id: quote.id,
        clienteNombre: quote.Order?.usuario?.nombre || quote.Order?.usuario?.correo || `ID ${quote.pedido_id}`,
        pedidoId: quote.pedido_id,
        estado: quote.estado,
        archivo_url: quote.archivo_url || "",
        pdf_aceptacion_url: quote.pdf_aceptacion_url || null,
        fecha: new Date(quote.fecha_creacion).toLocaleDateString("es-MX"),
      }));

      setQuotes(mapped);
    } catch (error) {
      console.error("Error al cargar cotizaciones:", error);
      toast.error("Error al cargar las cotizaciones");
    }
  };

  const handleSaveQuote = async (newQuote) => {
    try {
      const formData = new FormData();
      if (newQuote.tipoArchivo === "pdf") {
        formData.append("documento_pdf", newQuote.archivo);
      } else if (newQuote.tipoArchivo === "xml") {
        formData.append("documento_xml", newQuote.archivo);
      } else {
        toast.error("Tipo de archivo no válido");
        return;
      }

      formData.append("pedido_id", newQuote.pedidoId);
      formData.append("monto", "0");
      formData.append("descripcion", "Cotización generada por admin");

      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_URL_BACKEND}quotations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir cotización");

      const { quotation } = await res.json();

      const newEntry = {
        id: quotation.id,
        clienteNombre: newQuote.clienteNombre,
        pedidoId: newQuote.pedidoId,
        archivoUrl: quotation.documento_url,
        fecha: new Date().toLocaleDateString("es-MX"),
      };

      setQuotes((prev) => [...prev, newEntry]);
      fetchQuotes();
      toast.success("Cotización guardada exitosamente");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al guardar cotización:", error);
      toast.error("No se pudo guardar la cotización");
    }
  };

  const filteredQuotes = useMemo(() => {
    return quotes.filter((q) => {
      const matchesSearch = q.pedidoId.toString().toLowerCase().includes(searchText.toLowerCase());
      const matchesClient = selectedClient ? q.clienteNombre === selectedClient : true;
      const matchesStatus = selectedStatus ? q.estado === selectedStatus : true;

      return matchesSearch && matchesClient && matchesStatus;
    });
  }, [searchText, selectedClient, selectedStatus, quotes]);

  // Obtener lista única de clientes para el filtro
  const uniqueClients = useMemo(() => {
    const clients = [...new Set(quotes.map(q => q.clienteNombre))];
    return clients.sort();
  }, [quotes]);

  return (
    <div className="p-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Cotizaciones</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-md flex items-center gap-2"
        >
          <FilePlus size={16} />
          Nueva cotización
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <input
          type="text"
          placeholder="Buscar por ID de pedido..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm"
        />

        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm"
        >
          <option value="">Todos los clientes</option>
          {uniqueClients.map((client) => (
            <option key={client} value={client}>
              {client}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm"
        >
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredQuotes}
        pagination
        highlightOnHover
        responsive
        striped
        paginationComponentOptions={{
          rowsPerPageText: "Filas por página",
          rangeSeparatorText: "de",
        }}
      />

      <ModalSaveQuote
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveQuote}
      />
    </div>
  );
}
