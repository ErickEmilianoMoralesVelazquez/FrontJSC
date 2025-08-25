import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Trash2, Check, Image, MessageCircle, Clock } from "lucide-react";

export default function ModalCreateOrder({ isOpen, onClose, onCreate }) {
  const [uploadedPdf, setUploadedPdf] = useState(null);
  // const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [contactMethod, setContactMethod] = useState('whatsapp');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDate(now.toLocaleDateString());
    }
  }, [isOpen]);

  const handleClose = () => {
    setUploadedPdf(null);
    const fileInput = document.getElementById("pdf-upload");
    if (fileInput) fileInput.value = "";
    onClose();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedPdf(file);
    } else {
      alert("El archivo debe ser un PDF.");
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!uploadedPdf) {
      alert("Por favor selecciona un archivo PDF.");
      return;
    }
    
    const orderData = {
      pdf: uploadedPdf,
      contactMethod,
      timestamp: {
        time: currentTime,
        date: currentDate
      }
    };
    
    onCreate(orderData);
    handleClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
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
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-red-600" size={20} />
                Crear nuevo pedido
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Sube un archivo PDF con los detalles del pedido.
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="text-gray-500 hover:text-gray-700" size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campos automáticos de fecha y hora */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock size={16} className="text-red-600" />
                  Hora
                </label>
                <input
                  type="text"
                  value={currentTime}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock size={16} className="text-red-600" />
                  Fecha
                </label>
                <input
                  type="text"
                  value={currentDate}
                  readOnly
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                />
              </div>
            </div>

            {/* Selector de método de contacto */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <MessageCircle size={16} className="text-red-600" />
                Método de contacto
              </label>
              <div className="flex gap-4 p-2 bg-gray-50 rounded-lg">
                <button
                  type="button"
                  onClick={() => setContactMethod('whatsapp')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    contactMethod === 'whatsapp'
                      ? 'bg-red-600 shadow text-white'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    contactMethod === 'email'
                      ? 'bg-red-600 shadow text-white'
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  Email
                </button>
              </div>
            </div>

            {/* Campo de PDF */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Upload size={16} className="text-red-600" />
                Archivo PDF
              </label>

              {!uploadedPdf ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    isDragging ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
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

            {/* Footer */}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center gap-2"
              >
                <FileText size={16} />
                Subir pedido
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
