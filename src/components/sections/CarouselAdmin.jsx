import React, { useState } from 'react';

export default function CarouselAdmin() {
  const [slides, setSlides] = useState([
    {
      src: "/images/carrusel/slider-1.png",
      alt: "Slider 1",
    },
    {
      src: "/images/carrusel/slider-2.jpg",
      alt: "Slider 2",
    },
    {
      src: "/images/carrusel/slider-3.jpg",
      alt: "Slider 3",
    },
    {
      src: "/images/carrusel/slider-4.jpg",
      alt: "Slider 4",
    },
  ]);

  const [newSlide, setNewSlide] = useState({
    file: null,
    alt: ''
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSlide(prev => ({
        ...prev,
        file: file
      }));
    }
  };

  const handleAddSlide = async () => {
    if (newSlide.file && newSlide.alt) {
      try {
        // Crear una URL local para la imagen
        const imageUrl = URL.createObjectURL(newSlide.file);
        
        // Agregar la nueva imagen al estado
        setSlides([...slides, {
          src: imageUrl,
          alt: newSlide.alt,
          file: newSlide.file // Guardamos el archivo para uso futuro si es necesario
        }]);

        // Limpiar el formulario
        setNewSlide({
          file: null,
          alt: ''
        });

        // Resetear el input de archivo
        const fileInput = document.getElementById('imageInput');
        if (fileInput) fileInput.value = '';

      } catch (error) {
        console.error('Error:', error);
        alert('Error al agregar la imagen');
      }
    }
  };

  const handleRemoveSlide = (index) => {
    setSlides(slides.filter((_, i) => i !== index));
  };

  const handleMoveSlide = (index, direction) => {
    if (direction === 'up' && index > 0) {
      const newSlides = [...slides];
      [newSlides[index], newSlides[index - 1]] = [newSlides[index - 1], newSlides[index]];
      setSlides(newSlides);
    } else if (direction === 'down' && index < slides.length - 1) {
      const newSlides = [...slides];
      [newSlides[index], newSlides[index + 1]] = [newSlides[index + 1], newSlides[index]];
      setSlides(newSlides);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full mx-auto">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-red-500 to-red-600">
            <h2 className="text-3xl font-bold text-white">Administrar Carrusel</h2>
          </div>
          
          {/* Formulario para agregar nueva imagen */}
          <div className="p-6 border-b">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagen</label>
                <input
                  type="file"
                  id="imageInput"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 block w-full text-sm text-gray-500 pl-3
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <input
                  type="text"
                  value={newSlide.alt}
                  onChange={(e) => setNewSlide(prev => ({ ...prev, alt: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm
                    focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Descripción de la imagen"
                />
              </div>
              <button
                onClick={handleAddSlide}
                disabled={!newSlide.file || !newSlide.alt}
                className="w-full flex justify-center py-2 px-4 border border-transparent
                  rounded-md shadow-sm text-sm font-medium text-white bg-red-600
                  hover:bg-red-700 focus:outline-none focus:ring-2
                  focus:ring-offset-2 focus:ring-red-500
                  disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Agregar Imagen
              </button>
            </div>
          </div>

          {/* Lista de imágenes */}
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Imágenes del Carrusel</h3>
            <div className="space-y-4">
              {slides.map((slide, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
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
                      onClick={() => handleMoveSlide(index, 'up')}
                      disabled={index === 0}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveSlide(index, 'down')}
                      disabled={index === slides.length - 1}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleRemoveSlide(index)}
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
    </div>
  );
}