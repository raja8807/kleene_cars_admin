import React from "react";
import styles from "./StatCard.module.scss";
import { ArrowUpShort, ArrowDownShort } from "react-bootstrap-icons";

const StatCard = ({ title, value, icon, trend, trendValue }) => {
    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.iconWrapper}>
                    {icon}
                </div>
                {trend && (
                    <div className={`${styles.trend} ${trend === "up" ? styles.up : styles.down}`}>
                        {trend === "up" ? <ArrowUpShort /> : <ArrowDownShort />}
                        <span>{trendValue}</span>
                    </div>
                )}
            </div>
            <div className={styles.content}>
                <span className={styles.value}>{value}</span>
                <span className={styles.title}>{title}</span>
            </div>
        </div>
    );
};

export default StatCard;
