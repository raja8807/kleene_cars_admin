import React, { useState, useEffect } from "react";
import { AuthGuard } from "@/components/auth/AuthContext";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import styles from "./layout.module.scss";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

const Layout = ({ children }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const isAuthPage = router.pathname === "/login";

  useEffect(() => {
    if (isAuthPage) return;

    const channel = supabase
      .channel('admin_realtime_orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        toast.info(
          <div>
            <strong>New Order Placed!</strong>
            <br/>
            <small>Order ID: {String(payload.new.id).substring(0, 8)}</small>
          </div>,
          { autoClose: 6000 }
        );
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthPage]);

  if (isAuthPage) {
    return <div className={styles.authLayout}>{children}</div>;
  }

  return (
    <AuthGuard>
      <div className={styles.layoutContainer}>
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
        <div className={`${styles.mainWrapper} ${collapsed ? styles.collapsed : ''}`}>
          <Header />
          <main className={styles.content}>
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Layout;
