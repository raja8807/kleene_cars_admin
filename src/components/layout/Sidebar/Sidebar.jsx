import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
    Grid1x2Fill,
    CartFill,
    CollectionFill, // Catalog
    PeopleFill,
    Image, // Banner
    BoxArrowRight,
    CarFrontFill,
    PersonVideo3,
    ShieldLockFill,
    CreditCardFill
} from "react-bootstrap-icons";
import styles from "./Sidebar.module.scss";
import { useAuth } from "@/components/auth/AuthContext";

const Sidebar = ({ collapsed, onToggle }) => {
    const router = useRouter();
    const { signOut } = useAuth();

    const menuItems = [

        { label: "Orders", icon: <CartFill />, path: "/orders" },
        { label: "Payments", icon: <CreditCardFill />, path: "/payments" },
        { label: "Workers", icon: <PersonVideo3 />, path: "/workers" },
        { label: "Admins", icon: <ShieldLockFill />, path: "/admins", adminOnly: true },
        { label: "Catalog", icon: <CollectionFill />, path: "/catalog", adminOnly: true }, // Catalog restricted to admin
        { label: "Customers", icon: <PeopleFill />, path: "/customers" },
    ];

    const { role } = useAuth();
    const filteredMenuItems = menuItems.filter(item => !item.adminOnly || role === 'admin');

    // Helper to check active state
    const isActive = (path) => router.pathname === path;

    return (
        <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
            <div className={styles.header}>
                {!collapsed && (
                    <div className={styles.logo}>
                        <CarFrontFill className={styles.icon} />
                        <span>Kleene Cars</span>
                    </div>
                )}
                {collapsed && <CarFrontFill className={styles.logoIconCollapsed} />}

                <button className={styles.toggleBtn} onClick={onToggle}>
                    {collapsed ? <BoxArrowRight style={{ transform: 'rotate(180deg)' }} /> : <BoxArrowRight style={{ transform: 'rotate(0deg)' }} />}
                </button>
            </div>


            <nav className={styles.nav}>
                {filteredMenuItems.map((item) => (
                    <Link href={item.path} key={item.path} className={`${styles.navItem} ${isActive(item.path) ? styles.active : ""}`} title={collapsed ? item.label : ""}>
                        <span className={styles.icon}>{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>

            <div className={styles.footer}>
                <div className={styles.logout} onClick={signOut} title={collapsed ? "Logout" : ""}>
                    <BoxArrowRight />
                    {!collapsed && <span>Logout</span>}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
