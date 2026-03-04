import React, { useState } from "react";
import { BellFill, ArrowClockwise } from "react-bootstrap-icons";
import { useRouter } from "next/router";
import styles from "./Header.module.scss";
import { useAuth } from "@/components/auth/AuthContext";
import { useRefresh } from "@/context/RefreshContext";

const Header = () => {
  const router = useRouter();
  const { user, role } = useAuth();
  const { triggerRefresh } = useRefresh();
  const [refreshing, setRefreshing] = useState(false);

  const getTitle = () => {
    const path = router.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/orders") return "Orders Management";
    if (path === "/catalog") return "Catalog Management";
    if (path === "/customers") return "Customer Management";
    if (path === "/workers") return "Worker Management";
    if (path === "/payments") return "Payments Overview";
    if (path === "/admins") return "Admin Management";
    return "Admin Panel";
  };

  const handleRefresh = () => {
    setRefreshing(true);
    triggerRefresh();
    setTimeout(() => setRefreshing(false), 1000);
  };


  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <h1>{getTitle()}</h1>
      </div>

      <div className={styles.actions}>
        <button
          className={`${styles.iconBtn} ${refreshing ? styles.refreshing : ""}`}
          onClick={handleRefresh}
          title="Refresh Data"
        >
          <ArrowClockwise />
        </button>

        <button className={styles.iconBtn}>
          <BellFill />
        </button>

        <div className={styles.profile}>
          <div className={styles.avatar}>{user?.name?.charAt?.(0)?.toUpperCase?.() || "A"}</div>
          <div className={styles.info}>
            <span className={styles.name}>{user?.name || "Admin User"}</span>
            <span className={styles.role}>{role}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
