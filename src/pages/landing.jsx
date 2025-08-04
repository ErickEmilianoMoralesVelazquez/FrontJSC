import React from "react";
import { motion } from "framer-motion";
import Carousel from "../components/sections/carousel";
import CardsInfo from "../components/sections/cardsInfo";
import Testimonials from "../components//common/testimonials";
import Navbar from "../components/common/navbar";
import Footer from "../components/common/footer";

import landingBg from "../assets/images/Landing-full.png";
import landingImage from "../assets/images/landingImage.png";
import landingImage2 from "../assets/images/landingImage2.png";

// Imágenes individuales del proceso
import Step1 from "../assets/images/step1.png";
import Step2 from "../assets/images/step2.png";
import Step3 from "../assets/images/step3.png";
import Step4 from "../assets/images/step4.png";
import Step5 from "../assets/images/step5.png";
import Step6 from "../assets/images/step6.png";

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Landing() {
  return (
    <div
      className="bg-cover bg-no-repeat bg-center"
      style={{ backgroundImage: `url(${landingBg})` }}
    >
      <Navbar />
      <Carousel />

      {/* Características */}
      <motion.div
        className="w-full py-8 flex flex-col items-center justify-center text-center"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <h1 className="font-bold text-3xl sm:text-4xl md:text-5xl mb-2 mt-5">
          Características principales
        </h1>
        <p className="text-gray-900 max-w-3xl text-base sm:text-lg mt-5 px-4">
          Nuestra plataforma ofrece todas las herramientas que necesitas para
          optimizar tus procesos de negocio.
        </p>
        <CardsInfo />
      </motion.div>

      {/* ¿Cómo funciona? con solo imágenes */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center py-12"
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <img
          src={landingImage}
          alt="Decoración izquierda"
          className="hidden xl:block absolute left-0 top-8 w-52 lg:w-64 xl:w-80"
        />
        <h1 className="font-bold text-5xl mb-4">¿Cómo funciona?</h1>
        <p className="text-gray-900 max-w-3xl text-xl md:mb-10 px-4">
          Conoce nuestro flujo de trabajo paso a paso.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 px-4 w-full max-w-6xl">
          {[Step1, Step2, Step3, Step4, Step5, Step6].map((img, idx) => (
            <img key={idx} src={img} alt={`Paso ${idx + 1}`} className="w-full" />
          ))}
        </div>
      </motion.div>

      {/* Testimonios */}
      <div className="relative w-full md:mt-10">
        <img
          src={landingImage2}
          alt="Decoración derecha"
          className="hidden xl:block absolute right-0 top-8 w-52 lg:w-64 xl:w-80"
        />
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center text-center py-12"
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <h1 className="font-bold text-5xl mb-2">
            Lo que dicen nuestros clientes
          </h1>
          <p className="text-gray-900 max-w-3xl text-1xl md:mb-10 px-2">
            Empresas que ya han transformado sus procesos con nosotros.
          </p>
          <Testimonials />
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
