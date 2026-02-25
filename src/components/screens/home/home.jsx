import React, { useEffect, useState } from "react";
import styles from "./home.module.scss";
import StatCard from "@/components/ui/StatCard/StatCard";
import DataTable from "@/components/ui/DataTable/DataTable";
import { supabase } from "@/lib/supabaseClient";
import dashboardService from "@/services/dashboardService";
import {
  CurrencyRupee,
  Cart,
  People,
  ClockHistory
} from "react-bootstrap-icons";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const HomeScreen = () => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    activeUsers: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getStats();
      // const response = await fetch... // Removed

      setStats({
        totalOrders: data.totalOrders || 0,
        pendingOrders: data.pendingOrders || 0,
        activeUsers: data.activeUsers || 0,
        totalRevenue: data.totalRevenue || 0
      });
      setRevenueData(data.revenueData || []);
      setRecentOrders(data.recentOrders || []);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { label: "Order ID", key: "id", render: (row) => `#${row.id.toString().slice(0, 8)}` },
    { label: "Customer", key: "customer", render: (row) => row.users?.full_name || "Unknown" },
    {
      label: "Status",
      key: "status",
      render: (row) => (
        <span className={`${styles.statusBadge} ${styles[row.status?.toLowerCase()]}`}>
          {row.status}
        </span>
      )
    },
    { label: "Date", key: "created_at", render: (row) => new Date(row.created_at).toLocaleDateString() },
    { label: "Total", key: "total_amount", render: (row) => <strong>₹{row.total_amount}</strong> },
  ];

  return (
    <div className={styles.homeWrapper}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={<CurrencyRupee />} trend="up" trendValue="12%" />
        <StatCard title="Total Orders" value={stats.totalOrders} icon={<Cart />} trend="up" trendValue="8%" />
        <StatCard title="Active Users" value={stats.activeUsers} icon={<People />} trend="up" trendValue="5%" />
        <StatCard title="Pending Orders" value={stats.pendingOrders} icon={<ClockHistory />} />
      </div>

      {/* Weekly Revenue Chart Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Weekly Revenue</h2>
        </div>
        <div className={styles.chartContainer}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8833ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8833ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} dx={-10} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`₹${value}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8833ff" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Recent Orders</h2>
          <button onClick={() => { /* Navigate to /orders */ }}>View All</button>
        </div>
        <DataTable
          columns={columns}
          data={recentOrders}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default HomeScreen;
