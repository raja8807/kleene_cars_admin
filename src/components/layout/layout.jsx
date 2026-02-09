import React from "react";
import { AuthGuard } from "@/components/auth/AuthContext";
import Sidebar from "./Sidebar/Sidebar";
import Header from "./Header/Header";
import styles from "./layout.module.scss";
import { useRouter } from "next/router";

const Layout = ({ children }) => {
  const router = useRouter();
  const isAuthPage = router.pathname === "/login";

  if (isAuthPage) {
    return <div className={styles.authLayout}>{children}</div>;
  }

  return (
    <AuthGuard>
      <div className={styles.layoutContainer}>
        <Sidebar />
        <div className={styles.mainWrapper}>
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
