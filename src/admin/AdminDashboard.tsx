import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { api3d } from '../lib/api3d';
import { ShoppingCart, Package, TrendingUp, Layers, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface DashboardStats {
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    activeProducts: number;
    totalRevenue: number;
    totalMaterials: number;
}

interface RecentOrder {
    id: string;
    created_at: string;
    data: {
        totalPrice?: number;
        config?: {
            placedItems?: any[];
        };
    };
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<DashboardStats>({
        totalOrders: 0,
        pendingOrders: 0,
        totalProducts: 0,
        activeProducts: 0,
        totalRevenue: 0,
        totalMaterials: 0
    });
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [orders, products, materials] = await Promise.all([
                    api.getOrders(),
                    api3d.getAllItems3DAdmin(),
                    api3d.getMaterials3D()
                ]);

                const pendingCount = orders.filter((o: any) => 
                    !o.data?.status || o.data?.status === 'pending' || o.data?.isDraft
                ).length;

                const activeProductsCount = products.filter((p: any) => p.is_active).length;

                setStats({
                    totalOrders: orders.length,
                    pendingOrders: pendingCount,
                    totalProducts: products.length,
                    activeProducts: activeProductsCount,
                    totalRevenue: orders.reduce((sum: number, order: any) => 
                        sum + (order.data?.totalPrice || 0), 0
                    ),
                    totalMaterials: materials.length
                });

                setRecentOrders(orders.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
                <p className="text-sm text-slate-500 mt-1">Ringkasan statistik website dan katalog 3D</p>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-teal-50 text-teal-600 rounded-lg">
                        <ShoppingCart size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500">Total Pesanan</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.totalOrders}</p>
                        {stats.pendingOrders > 0 && (
                            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <Clock size={12} /> {stats.pendingOrders} pending
                            </p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Package size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500">Produk 3D</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.totalProducts}</p>
                        <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                            <CheckCircle2 size={12} /> {stats.activeProducts} aktif
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500">Estimasi Revenue</p>
                        <p className="text-2xl font-bold text-slate-800">Rp {stats.totalRevenue.toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 flex items-center space-x-4 hover:shadow-md transition-shadow">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-lg">
                        <Layers size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-slate-500">Material HPL</p>
                        <p className="text-2xl font-bold text-slate-800">{stats.totalMaterials}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl shadow-sm p-6 flex items-center space-x-4 text-white col-span-1 md:col-span-2 lg:col-span-2">
                    <div className="p-3 bg-white/20 rounded-lg">
                        <AlertCircle size={24} />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-teal-50">Status Sistem</p>
                        <p className="text-xl font-bold">Semua sistem berjalan normal</p>
                        <p className="text-xs text-teal-100 mt-1">Katalog 3D terhubung • CMS aktif • Database online</p>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            {recentOrders.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800">Pesanan Terbaru</h3>
                        <p className="text-sm text-slate-500 mt-1">5 pesanan terakhir dari konfigurator 3D</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Items</th>
                                    <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-slate-600">
                                                {order.id.slice(0, 8)}...
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {order.data?.config?.placedItems?.length || 0} item
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-slate-800">
                                            Rp {(order.data?.totalPrice || 0).toLocaleString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
