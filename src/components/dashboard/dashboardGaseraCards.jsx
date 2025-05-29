import React, { useEffect, useState } from 'react';
import { CalendarDays, FileText, DollarSign } from 'lucide-react';

export default function DashboardGaseraCards() {
  const [ordersCount, setOrdersCount] = useState(0);
  const [quotesCount, setQuotesCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchOrders = async () => {
      try {
        const res = await fetch('http://localhost:3001/orders', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setOrdersCount(data.length || 0);
      } catch (err) {
        console.error('Error al obtener pedidos:', err);
      }
    };

    const fetchQuotations = async () => {
      try {
        const res = await fetch('http://localhost:3001/quotations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setQuotesCount(data.length || 0);
      } catch (err) {
        console.error('Error al obtener cotizaciones:', err);
      }
    };

    fetchOrders();
    fetchQuotations();
  }, []);

  const cards = [
    {
      label: 'Pedidos',
      value: ordersCount,
      icon: <CalendarDays className="text-red-500" />,
    },
    {
      label: 'Cotizaciones',
      value: quotesCount,
      icon: <FileText className="text-yellow-400" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-white shadow-sm p-4 rounded-lg border-t-4 border-red-400">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">{card.label}</p>
              <h3 className="text-xl font-bold">{card.value}</h3>
            </div>
            <div className="bg-red-50 p-2 rounded-full">{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
