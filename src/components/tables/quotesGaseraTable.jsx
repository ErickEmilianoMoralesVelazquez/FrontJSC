import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Eye,
  X,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
  Upload,
  FileText,
  Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const badgeColor = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700"
};

export default function QuotesGaseraTable() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [quoteIdToPay, setQuoteIdToPay] = useState(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [dateError, setDateError] = useState("");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [quoteToUpload, setQuoteToUpload] = useState(null);
  const [uploadedPdf, setUploadedPdf] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadPaymentDate, setUploadPaymentDate] = useState("");

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
      const data = await res.json();

      const mapped = data.map((q) => ({
        id: `COT-${q.id}`,
        fecha: new Date(q.fecha_creacion).toLocaleDateString("es-MX"),
        estatus:
          q.estado === "aceptada"
            ? "Aceptada"
            : q.estado === "rechazada"
            ? "Rechazada"
            : "Pendiente",
        color:
          q.estado === "aceptada"
            ? "green"
            : q.estado === "rechazada"
            ? "red"
            : "yellow",
        fecha_pago: q.fecha_pago_aproximada
          ? new Date(q.fecha_pago_aproximada).toLocaleDateString("es-MX")
          : "No asignada",
        archivo_url: q.archivo_url,
        raw: q,
      }));

      setQuotes(mapped);
    } catch (err) {
      console.error("Error al obtener cotizaciones:", err);
      toast.error("Error al cargar las cotizaciones");
    }
  };

  const updateStatus = (numericId, status) => {
    setQuotes((prev) =>
      prev.map((q) =>
        q.raw.id === numericId
          ? {
              ...q,
              estatus: status,
              color:
                status === "Aceptada"
                  ? "green"
                  : status === "Rechazada"
                  ? "red"
                  : "yellow",
            }
          : q
      )
    );
  };

  const openUploadModal = (quoteId) => {
    setQuoteToUpload(parseInt(quoteId.replace("COT-", "")));
    setUploadedPdf(null);
    setUploadPaymentDate("");
    setIsDragging(false);
    setShowUploadDialog(true);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedPdf(file);
    } else {
      toast.error("El archivo debe ser un PDF.");
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
    handleFileUpload(e);
  };

  const handleRemovePdf = () => {
    setUploadedPdf(null);
    const fileInput = document.getElementById("pdf-upload");
    if (fileInput) fileInput.value = "";
  };

  const uploadAcceptancePdf = async () => {
    if (!uploadedPdf) {
      toast.error("Debes seleccionar un archivo PDF.");
      return;
    }

    if (!uploadPaymentDate) {
      toast.error("Debes seleccionar una fecha límite de pago.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("pdf", uploadedPdf);
      formData.append("fecha_limite_pago", uploadPaymentDate);

      const res = await fetch(
        `${import.meta.env.VITE_URL_BACKEND}quotations/${quoteToUpload}/upload-acceptance`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.message || "Error al subir el PDF de aceptación");
        return;
      }

      setShowUploadDialog(false);
      fetchQuotes();
      toast.success("PDF de aceptación subido correctamente");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Error al subir el PDF de aceptación");
    }
  };

  const openPaymentModal = (quoteId) => {
    setQuoteIdToPay(parseInt(quoteId.replace("COT-", "")));
    setPaymentDate("");
    setDateError("");
    setShowPaymentDialog(true);
  };

  const handlePaymentDateSubmit = async () => {
    if (!paymentDate) {
      setDateError("Debes seleccionar una fecha válida");
      toast.error("Debes seleccionar una fecha válida");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_URL_BACKEND}quotations/${quoteIdToPay}/set-payment-date`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fecha_pago_aproximada: paymentDate }),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();
        setDateError(errorData.message);
        toast.error(errorData.message);
        return;
      }

      setShowPaymentDialog(false);
      fetchQuotes();
      toast.success("Fecha de pago asignada correctamente");
    } catch (err) {
      console.error("Error:", err);
      setDateError("Error al asignar la fecha");
      toast.error("Error al asignar la fecha de pago");
    }
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "" || q.estatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const columns = [
    {
      name: "ID Cotización",
      selector: (row) => row.id,
      sortable: true,
    },
    {
      name: "Fecha",
      selector: (row) => row.fecha,
    },
    {
      name: "Estatus",
      cell: (row) => (
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeColor[row.color]}`}
        >
          {row.estatus}
        </span>
      ),
    },
    {
      name: "Fecha de Pago",
      selector: (row) => row.fecha_pago,
    },
    {
        name: "Acciones",
        cell: (row) => (
          <div className="flex gap-2">
            <Eye
              className="w-4 h-4 text-blue-500 cursor-pointer"
              onClick={() => window.open(row.archivo_url, "_blank")}
            />
            {row.estatus === "Pendiente" && (
              <Upload
                className="w-4 h-4 text-green-500 cursor-pointer hover:scale-110 transition"
                onClick={() => openUploadModal(row.id)}
                title="Subir Aceptación"
              />
            )}
            {(row.estatus === "Aceptada" || row.estatus === "Con PDF") ? (
              <DollarSign
                className="w-4 h-4 text-yellow-500 cursor-pointer"
                onClick={() => openPaymentModal(row.id)}
                title="Asignar fecha de pago"
              />
            ) : (
              <DollarSign
                className="w-4 h-4 text-gray-300"
                title="Solo disponible para cotizaciones aceptadas o con PDF"
              />
            )}
          </div>
        ),
      },
  ];

  return (
    <div className="bg-white rounded-xl shadow-md w-full  mx-auto px-4 py-6">
      <h2 className="text-xl font-bold mb-4">Gestión de Cotizaciones</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar cotización..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md text-sm w-full"
        >
          <option value="">Filtrar por estatus</option>
          <option value="Aceptada">Aceptada</option>
          <option value="Rechazada">Rechazada</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Con PDF">Con PDF</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={filteredQuotes}
        pagination
        highlightOnHover
        striped
        responsive
        persistTableHead
        noDataComponent="No se encontraron cotizaciones."
      />

      {/* Modal de Subida de PDF de Aceptación */}
      <AnimatePresence>
        {showUploadDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-100 relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full text-red-600">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Subir Aceptación
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Sube el PDF de aceptación y selecciona la fecha límite de pago
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="text-gray-500 hover:text-gray-700" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Campo de PDF */}
                <div>
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                    <Upload size={16} className="text-red-600" />
                    Archivo PDF de Aceptación
                  </label>

                  {!uploadedPdf ? (
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${isDragging ? "border-red-500 bg-blue-50" : "border-gray-300"}`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <FileText size={40} className="mx-auto text-gray-400 mb-3" />
                      <p className="font-medium text-gray-700">
                        Arrastra y suelta tu archivo PDF aquí
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Solo se aceptan archivos PDF, máximo 10MB
                      </p>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        id="pdf-upload"
                        onChange={handleFileUpload}
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="inline-block mt-4 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 cursor-pointer transition-colors"
                      >
                        Seleccionar archivo
                      </label>
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full text-green-600">
                            <Check size={16} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {uploadedPdf.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(uploadedPdf.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemovePdf}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                          aria-label="Eliminar PDF"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo de fecha límite de pago */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="p-2 bg-gray-100 rounded-full text-red-600">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Fecha límite de pago (máximo 30 días a partir de hoy)
                    </p>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border-b rounded-lg border-gray-300 bg-transparent focus:border-red-600 focus:outline-none text-sm font-medium text-gray-900"
                      value={uploadPaymentDate}
                      min={new Date().toISOString().split("T")[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                      onChange={(e) => setUploadPaymentDate(e.target.value)}
                    />
                  </div>
                </motion.div>

                <p className="text-xs text-gray-500 italic">
                  Nota: La fecha de pago debe estar entre hoy y los próximos 30 días.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3"
              >
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={uploadAcceptancePdf}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <Check size={16} />
                  Confirmar Aceptación
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* Modal de Fecha de Pago */}
      <AnimatePresence>
        {showPaymentDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white p-6 rounded-xl w-full max-w-md shadow-2xl border border-gray-100 relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full text-red-600">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Asignar fecha de pago
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Seleccione la fecha de pago para esta cotización
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPaymentDialog(false)}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Cerrar modal"
                >
                  <X className="text-gray-500 hover:text-gray-700" size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="p-2 bg-red-100 rounded-full text-red-600">
                    <Calendar size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Fecha de pago (máximo 30 días a partir de hoy)
                    </p>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border-b rounded-lg border-gray-300 bg-transparent focus:border-red-500 focus:outline-none text-sm font-medium text-gray-900"
                      value={paymentDate}
                      min={new Date().toISOString().split("T")[0]}
                      max={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                      onChange={(e) => {
                        setPaymentDate(e.target.value);
                        setDateError("");
                      }}
                    />
                  </div>
                </motion.div>

                {dateError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-2 text-sm text-red-500 bg-red-50 p-3 rounded-lg"
                  >
                    <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{dateError}</span>
                  </motion.div>
                )}
                <p className="text-xs text-gray-500 italic">
                  Nota: La fecha de pago debe estar entre hoy y los próximos 30 días.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3"
              >
                <button
                  onClick={() => setShowPaymentDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handlePaymentDateSubmit}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  <Check size={16} />
                  Confirmar fecha
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
