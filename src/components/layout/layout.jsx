import React, { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthContext";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import styles from "./layout.module.scss";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const isAuthPage = router.pathname === "/login";

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
