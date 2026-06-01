import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ShoppingCart, Package, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [stats, setStats] = useState({ orders: 0, products: 0, revenue: 0 });

    useEffect(() => {
        Promise.all([api.getOrders(), api.getProducts()]).then(([orders, products]) => {
            setStats({
                orders: orders.length,
                products: products.length,
                revenue: orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
            });
        });
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Ringkasan</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                        <ShoppingCart size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Pesanan</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.orders}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Total Produk</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.products}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Estimasi Revenue</p>
                        <p className="text-2xl font-bold text-slate-800">Rp {stats.revenue.toLocaleString('id-ID')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
