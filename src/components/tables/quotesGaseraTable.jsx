import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  Eye,
  CheckCircle,
  XCircle,
  X,
  DollarSign,
  Calendar,
  AlertCircle,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const badgeColor = {
  green: "bg-green-100 text-green-700",
  yellow: "bg-yellow-100 text-yellow-700",
  red: "bg-red-100 text-red-700",
};

export default function QuotesGaseraTable() {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [quoteToUpdate, setQuoteToUpdate] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [securityCode, setSecurityCode] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [quoteIdToPay, setQuoteIdToPay] = useState(null);
  const [paymentDate, setPaymentDate] = useState("");
  const [dateError, setDateError] = useState("");

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

  const promptStatusChange = (quoteRaw, status) => {
    setQuoteToUpdate(quoteRaw);
    setCurrentAction(status);
    setSecurityCode("");
    setErrorCode("");
    setShowCodeDialog(true);
  };

  const confirmCodeAndUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const idNumerico = quoteToUpdate.id;

      const endpoint =
        currentAction === "Aceptada"
          ? `${import.meta.env.VITE_URL_BACKEND}quotations/${idNumerico}/accept`
          : `${import.meta.env.VITE_URL_BACKEND}quotations/${idNumerico}/reject`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ clave_secreta: securityCode }),
      });

      if (!res.ok) {
        setErrorCode("Código incorrecto o acción no permitida.");
        toast.error("Código incorrecto o acción no permitida");
        return;
      }

      updateStatus(idNumerico, currentAction);
      setShowCodeDialog(false);
      toast.success(`Cotización ${currentAction.toLowerCase()} exitosamente`);
    } catch (err) {
      console.error("Error al actualizar cotización:", err);
      setErrorCode("Hubo un error al confirmar. Intenta nuevamente.");
      toast.error("Error al actualizar el estado de la cotización");
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
          <CheckCircle
            className="w-4 h-4 text-green-500 cursor-pointer"
            onClick={() => promptStatusChange(row.raw, "Aceptada")}
          />
          <XCircle
            className="w-4 h-4 text-red-500 cursor-pointer"
            onClick={() => promptStatusChange(row.raw, "Rechazada")}
          />
          {row.estatus === "Aceptada" ? (
            <DollarSign
              className="w-4 h-4 text-yellow-500 cursor-pointer"
              onClick={() => openPaymentModal(row.id)}
            />
          ) : (
            <DollarSign
              className="w-4 h-4 text-gray-300"
              title="Solo disponible para cotizaciones aceptadas"
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

      {/* Aquí podrías renderizar un modal si deseas mostrar la clave secreta */}
      {showCodeDialog && (
  <AnimatePresence>
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
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {currentAction === "Aceptada" ? (
                <CheckCircle className="text-green-600" size={24} />
              ) : (
                <XCircle className="text-red-600" size={24} />
              )}
              Confirmar {currentAction === "Aceptada" ? "aceptación" : "rechazo"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              ID de cotización: {quoteToUpdate?.id}
            </p>
          </div>
          <button
            onClick={() => setShowCodeDialog(false)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="text-gray-500 hover:text-gray-700" size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Ingresa el código de seguridad para{" "}
              {currentAction === "Aceptada" ? "aceptar" : "rechazar"} esta cotización.
            </p>
            <div className="relative">
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Código de seguridad"
                value={securityCode}
                onChange={(e) => {
                  setSecurityCode(e.target.value);
                  setErrorCode("");
                }}
              />
              {errorCode && (
                <p className="text-red-500 text-xs mt-1">{errorCode}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={() => setShowCodeDialog(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={confirmCodeAndUpdate}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
              currentAction === "Aceptada" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            Confirmar {currentAction === "Aceptada" ? "aceptación" : "rechazo"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  </AnimatePresence>
)}


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
