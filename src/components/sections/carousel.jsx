import React, { useEffect, useState } from "react";

export default function Carousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_URL_BACKEND}carousel/list`);
        const data = await res.json();
        const formatted = data.map(item => ({
          src: item.image_url,
          alt: item.caption
        }));
        setSlides(formatted);
      } catch (error) {
        console.error('Error al obtener imágenes del carrusel:', error);
      }
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (slides.length === 0) return null; // No mostrar nada si aún no hay imágenes

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] md:h-[600px] overflow-hidden">
      {slides.map((slide, index) => (
        <img
          key={index}
          src={slide.src}
          alt={slide.alt}
          className={`absolute w-full h-full object-cover transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      ))}

      {/* Botón anterior */}
      <button
        onClick={goToPrev}
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-black p-2 rounded-full z-10 cursor-pointer"
      >
        ‹
      </button>

      {/* Botón siguiente */}
      <button
        onClick={goToNext}
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-white/30 hover:bg-white/50 text-black p-2 rounded-full z-10 cursor-pointer"
      >
        ›
      </button>
    </div>
  );
}
