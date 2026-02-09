import React from "react";
import { BellFill } from "react-bootstrap-icons";
import { useRouter } from "next/router";
import styles from "./Header.module.scss";

const Header = () => {
  const router = useRouter();

  const getTitle = () => {
    const path = router.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/orders") return "Orders Management";
    if (path === "/catalog") return "Catalog Management";
    if (path === "/customers") return "Customer Management";
    return "Admin Panel";
  };

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
          <div className={styles.avatar}>AD</div>
          <div className={styles.info}>
            <span className={styles.name}>Admin User</span>
            <span className={styles.role}>Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
