import React, { useEffect, useState } from "react";

const defaultSlides = [
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
];

export default function Carousel({ slides = defaultSlides }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000); // cambia cada 5 segundos

    return () => clearInterval(interval); // limpia en desmontaje
  }, [slides.length]);

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

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
