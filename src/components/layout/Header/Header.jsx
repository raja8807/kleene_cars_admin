import React from "react";
import { BellFill } from "react-bootstrap-icons";
import { useRouter } from "next/router";
import styles from "./Header.module.scss";
import { useAuth } from "@/components/auth/AuthContext";

const Header = () => {
  const router = useRouter();
  const { user, role } = useAuth();

  const getTitle = () => {
    const path = router.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/orders") return "Orders Management";
    if (path === "/catalog") return "Catalog Management";
    if (path === "/customers") return "Customer Management";
    return "Admin Panel";
  };

  console.log(user);


  return (
    <header className={styles.header}>
      <div className={styles.title}>
        <h1>{getTitle()}</h1>
      </div>

      <div className={styles.actions}>
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
