import React, { useEffect, useState } from "react";
import styles from "./home.module.scss";
import StatCard from "@/components/ui/StatCard/StatCard";
import DataTable from "@/components/ui/DataTable/DataTable";
import { supabase } from "@/lib/supabaseClient";
import {
  CurrencyDollar,
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

      // ... existing fetch logic for stats ...
      const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: pendingCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'Pending');
      const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });

      const { data: revData } = await supabase.from('orders').select('total_amount, created_at').eq('status', 'Completed');
      let totalRevenue = 0;
      if (revData) {
        totalRevenue = revData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

        // Process Weekly Data
        const last7Days = [...Array(7)].map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - i);
          return {
            date: d.toLocaleDateString('en-US', { weekday: 'short' }),
            fullDate: d.toISOString().split('T')[0],
            revenue: 0
          };
        }).reverse();

        revData.forEach(order => {
          const orderDate = order.created_at.split('T')[0];
          const day = last7Days.find(d => d.fullDate === orderDate);
          if (day) day.revenue += order.total_amount;
        });
        setRevenueData(last7Days);
      }

      const { data: recentData } = await supabase
        .from('orders')
        .select(`id, status, total_amount, created_at, users (full_name)`)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalRevenue,
        totalOrders: ordersCount || 0,
        activeUsers: usersCount || 0,
        pendingOrders: pendingCount || 0
      });

      setRecentOrders(recentData || []);

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
    { label: "Total", key: "total_amount", render: (row) => <strong>${row.total_amount}</strong> },
  ];

  return (
    <div className={styles.homeWrapper}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toLocaleString()}`} icon={<CurrencyDollar />} trend="up" trendValue="12%" />
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
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#888', fontSize: 12 }} tickFormatter={(value) => `$${value}`} dx={-10} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`$${value}`, 'Revenue']}
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
