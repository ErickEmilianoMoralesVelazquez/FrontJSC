import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Superadmin
import DashboardLayout from "./components/layouts/dashboardLayout";
import OrdersTable from "./components/tables/ordersTable";
import Quotes from "./components/tables/quotesTable";
import InvoicesTable from "./components/tables/invoicesTable";
import PaymentsTable from "./components/tables/paymentsTable";
import BackorderTable from "./components/tables/backorderTable";
import UsersTable from "./components/tables/usersTable";

// Gasera
import DashboardLayoutGasera from "./components/layouts/dashboardLayoutGasera";
import OrdersGaseraTable from "./components/tables/ordersGaseraTable";
import QuotesGaseraTable from "./components/tables/quotesGaseraTable";

import MyLogin from "./pages/login";
import CarouselAdmin from "./components/sections/CarouselAdmin";
import "./App.css";

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Público */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<MyLogin />} />
          <Route path="/carrusel-admin" element={<CarouselAdmin />}></Route>

          {/* Privado con layout de dashboard */}
          <Route path="/dashboard/superadmin" element={<DashboardLayout />}>
            <Route index element={<OrdersTable />} />
            <Route path="quotes" element={<Quotes />} />
            <Route path="invoices" element={<InvoicesTable />} />
            <Route path="payments" element={<PaymentsTable />} />
            <Route path="backorders" element={<BackorderTable />} />
            <Route path="users" element={<UsersTable />} />
          </Route>

          {/* Privado con layout de dashboard gasera */}
          <Route path="/dashboard/gasera" element={<DashboardLayoutGasera />}>
            <Route index path="orders" element={<OrdersGaseraTable />} />
            <Route path="quotes" element={<QuotesGaseraTable />} />
          </Route>
        </Routes>
      </BrowserRouter>

      {/* ToastContainer siempre fuera de Router para que funcione globalmente */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}