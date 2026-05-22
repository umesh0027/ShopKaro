import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiCheck, FiPackage, FiArrowRight } from 'react-icons/fi';
import { orderAPI } from '../../services/api';

const OrderSuccess = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    orderAPI.getOne(id).then(r => setOrder(r.data.order)).catch(() => {});
  }, [id]);

  return (
    <div className="pt-20 min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4 animate-fade-in">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheck size={40} className="text-green-600" strokeWidth={3} />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-500 mb-2">Thank you for your purchase 🎉</p>
        {order && <p className="font-mono text-primary-600 font-bold text-sm mb-6">#{order.orderNumber}</p>}
        <p className="text-sm text-gray-500 mb-8">A confirmation email has been sent to your inbox with order details.</p>
        <div className="flex gap-3 justify-center">
          <Link to={`/orders/${id}`} className="btn-primary flex items-center gap-2"><FiPackage /> Track Order</Link>
          <Link to="/products" className="btn-secondary flex items-center gap-2">Shop More <FiArrowRight /></Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
