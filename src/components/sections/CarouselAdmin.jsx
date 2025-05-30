import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CarouselAdmin() {
  const [slides, setSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({ url: "", alt: "" });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedSlideId, setSelectedSlideId] = useState(null);

  const BACKEND_URL = import.meta.env.VITE_URL_BACKEND;

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}carousel/list`);
        const data = await res.json();
        setSlides(
          data.map((item) => ({
            id: item.id,
            src: item.image_url,
            alt: item.caption,
          }))
        );
      } catch (error) {
        console.error("Error al cargar imágenes:", error);
        toast.error("Error al cargar las imágenes");
      }
    };

    fetchSlides();
  }, [BACKEND_URL]);

  const handleAddSlide = async () => {
    if (!newSlide.url || !newSlide.alt) return;

    try {
      const res = await fetch(`${BACKEND_URL}carousel/upload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          image_url: newSlide.url,
          caption: newSlide.alt,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar imagen");

      setSlides((prev) => [
        ...prev,
        {
          id: data.id,
          src: data.image_url,
          alt: data.caption,
        },
      ]);

      setNewSlide({ url: "", alt: "" });
      toast.success("Imagen agregada correctamente");
    } catch (error) {
      console.error("Error al agregar imagen:", error);
      toast.error("Error al agregar la imagen");
    }
  };

  const confirmDelete = (slideId) => {
    setSelectedSlideId(slideId);
    setShowConfirmDialog(true);
  };

  const cancelDelete = () => {
    setSelectedSlideId(null);
    setShowConfirmDialog(false);
  };

  const executeDelete = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}carousel/${selectedSlideId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar");

      setSlides((prev) => prev.filter((slide) => slide.id !== selectedSlideId));
      toast.success("Imagen eliminada correctamente");
    } catch (error) {
      console.error("Error al eliminar imagen:", error);
      toast.error("Error al eliminar la imagen");
    } finally {
      setShowConfirmDialog(false);
      setSelectedSlideId(null);
    }
  };

  const handleMoveSlide = (index, direction) => {
    const newSlides = [...slides];
    if (direction === "up" && index > 0) {
      [newSlides[index], newSlides[index - 1]] = [
        newSlides[index - 1],
        newSlides[index],
      ];
    } else if (direction === "down" && index < slides.length - 1) {
      [newSlides[index], newSlides[index + 1]] = [
        newSlides[index + 1],
        newSlides[index],
      ];
    }
    setSlides(newSlides);
  };

  return (
    <div className="mx-auto overflow-hidden">
      <div className="w-full mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600">
            <h2 className="text-3xl font-bold text-white">
              Administrar Carrusel
            </h2>
          </div>

          {/* Formulario */}
          <div className="p-6 border-b space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL de la Imagen
              </label>
              <input
                type="text"
                value={newSlide.url}
                onChange={(e) =>
                  setNewSlide((prev) => ({ ...prev, url: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <input
                type="text"
                value={newSlide.alt}
                onChange={(e) =>
                  setNewSlide((prev) => ({ ...prev, alt: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Descripción de la imagen"
              />
            </div>
            <button
              onClick={handleAddSlide}
              disabled={!newSlide.url || !newSlide.alt}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Agregar Imagen
            </button>
          </div>

          {/* Lista de imágenes */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Imágenes del Carrusel
            </h3>

            <div className="space-y-4 overflow-y-auto max-h-[380px] pr-2">
              {slides.map((slide, index) => (
                <div
                  key={slide.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg"
                >
                  <img
                    src={slide.src}
                    alt={slide.alt}
                    className="h-20 w-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{slide.alt}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleMoveSlide(index, "up")}
                      disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveSlide(index, "down")}
                      disabled={index === slides.length - 1}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => confirmDelete(slide.id)}
                      className="p-2 text-red-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800">
              ¿Eliminar imagen?
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Esta acción no se puede deshacer. ¿Estás seguro de eliminar esta
              imagen del carrusel?
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={executeDelete}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
