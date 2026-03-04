import React, { useState, useEffect } from "react";
import styles from "./Payments.module.scss";
import DataTable from "@/components/ui/DataTable/DataTable";
import {
    CurrencyRupee,
    FileText,
    Person,
    Briefcase,
    CheckCircle,
    Clock,
    Box,
} from "react-bootstrap-icons";
import { toast } from "react-toastify";
import paymentService from "@/services/paymentService";
import { useRefresh } from "@/context/RefreshContext";

const PaymentsScreen = () => {
    const { refreshKey } = useRefresh();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        fetchPayments();
    }, [refreshKey]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const data = await paymentService.getAllPayments();
            setPayments(data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load payments");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getFilteredPayments = () => {
        if (filter === "All") return payments;
        return payments.filter((p) => p.status === filter);
    };

    const filteredPayments = getFilteredPayments();

    const columns = [
        {
            label: (
                <>
                    <FileText /> Order ID
                </>
            ),
            key: "order_id",
            render: (row) => <strong>#{row.Order?.order_id || row.order_id.slice(0, 8).toUpperCase()}</strong>,
        },
        {
            label: (
                <>
                    <Person /> Customer
                </>
            ),
            key: "customer",
            render: (row) => (
                <div>
                    <p className={styles.name}>{row.Order?.User?.full_name}</p>
                    <p className={styles.subtext}>{row.Order?.User?.phone}</p>
                </div>
            ),
        },
        {
            label: (
                <>
                    <Briefcase /> Worker
                </>
            ),
            key: "worker",
            render: (row) => (
                <div>
                    <p className={styles.name}>{row.Worker?.name}</p>
                    <p className={styles.subtext}>{row.Worker?.phone}</p>
                </div>
            ),
        },
        // {
        //     label: (
        //         <>
        //             <Box /> Items
        //         </>
        //     ),
        //     key: "items",
        //     render: (row) => (
        //         <div className={styles.itemsColumn}>
        //             {row.PaymentItems?.map((item, idx) => (
        //                 <p key={idx} className={styles.itemRow}>
        //                     {item.name} x {item.quantity}
        //                 </p>
        //             ))}
        //         </div>
        //     ),
        // },
        {
            label: (
                <>
                    <CurrencyRupee /> Amount
                </>
            ),
            key: "amount",
            render: (row) => {
                const total = row.PaymentItems?.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
                return <strong className={styles.amount}>₹{total}</strong>;
            },
        },
        {
            label: "Status",
            key: "status",
            render: (row) => (
                <span
                    className={`${styles.statusBadge} ${styles[row.status?.toLowerCase()]}`}
                >
                    {row.status}
                </span>
            ),
        },
        {
            label: "Date",
            key: "created_at",
            render: (row) => <p className={styles.date}>{formatDate(row.created_at)}</p>,
        },
    ];

    const stats = {
        total: payments.length,
        completed: payments.filter((p) => p.status === "Completed").length,
        pending: payments.filter((p) => p.status === "Pending").length,
        totalVolume: payments
            .filter((p) => p.status === "Completed")
            .reduce((sum, p) => sum + p.PaymentItems?.reduce((s, i) => s + (parseFloat(i.price) * i.quantity), 0), 0),
    };

    return (
        <div className={styles.paymentsWrapper}>
            <div className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.blue}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Total Payments</span>
                        <span className={styles.value}>{stats.total}</span>
                    </div>
                    <div className={styles.icon}><FileText /></div>
                </div>
                <div className={`${styles.statCard} ${styles.green}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Completed</span>
                        <span className={styles.value}>{stats.completed}</span>
                    </div>
                    <div className={styles.icon}><CheckCircle /></div>
                </div>
                <div className={`${styles.statCard} ${styles.orange}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Pending</span>
                        <span className={styles.value}>{stats.pending}</span>
                    </div>
                    <div className={styles.icon}><Clock /></div>
                </div>
                <div className={`${styles.statCard} ${styles.purple}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Total Volume</span>
                        <span className={styles.value}>₹{stats.totalVolume.toLocaleString()}</span>
                    </div>
                    <div className={styles.icon}><CurrencyRupee /></div>
                </div>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.listSection}>
                    <div className={styles.tabsHeader}>
                        <div className={styles.tabs}>
                            {["All", "Pending", "Completed", "Failed"].map((t) => (
                                <button
                                    key={t}
                                    className={filter === t ? styles.active : ""}
                                    onClick={() => setFilter(t)}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <DataTable
                            columns={columns}
                            data={filteredPayments}
                            loading={loading}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentsScreen;
