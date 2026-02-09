import React, { useState, useEffect } from "react";
import styles from "./Orders.module.scss";
import DataTable from "@/components/ui/DataTable/DataTable";
import OrderDetails from "./OrderDetails/OrderDetails";
import { supabase } from "@/lib/supabaseClient";
import {
    Search,
    Bell,
    Calendar4,
    BoxSeam,
    CurrencyRupee,
    FileText,
    BagCheck,
    ClockHistory,
    Truck,
    ArrowUpShort
} from "react-bootstrap-icons";
import { toast } from "react-toastify";

const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

const OrdersScreen = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All Orders");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          users (full_name, phone),
          vehicles (brand, model, number, type),
          addresses (house, street, area, city, pincode),
          order_items (name, price, item_type)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatusLocal = (orderId, newStatus) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
        // Update selected order if it's the one that changed
        if (selectedOrder?.id === orderId) {
            setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
    };

    const stats = {
        newOrders: orders.filter(o => o.status === 'Booked').length,
        ongoing: orders.filter(o => ['Confirmed', 'Worker Assigned', 'Worker Reached Location', 'Service Ongoing'].includes(o.status)).length,
        completed: orders.filter(o => o.status === 'Completed').length,
    };

    const getFilteredOrders = () => {
        let result = orders;

        if (filter !== "All Orders") {
            result = result.filter(o => o.status === filter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.id.toString().includes(q) ||
                o.users?.full_name?.toLowerCase().includes(q)
            );
        }

        return result;
    };

    const filteredOrders = getFilteredOrders();

    const columns = [
        { label: <><FileText /> Order ID</>, key: "id", render: (row) => <strong>#{row.id.toString().slice(0, 6)}</strong> },
        { label: <><Calendar4 /> Ordered Date</>, key: "created_at", render: (row) => row.created_at.split('T')[0] },
        { label: <><BoxSeam /> Product Name</>, key: "product", render: (row) => row.order_items?.[0]?.name || "Service" },
        { label: <><CurrencyRupee /> Price</>, key: "total_amount", render: (row) => <strong>₹{row.total_amount}</strong> },
        {
            label: "Status", key: "status", render: (row) => (
                <span className={`${styles.statusBadge} ${styles[row.status?.toLowerCase().replace(/\s+/g, '-')]}`}>
                    {row.status}
                </span>
            )
        },
    ];

    return (
        <div className={styles.ordersWrapper}>
            {/* Header - Keeping it here or extracing to PageHeader component if needed */}
            {/* <div className={styles.topActions}>
                <div className={styles.searchBar}>
                    <Search />
                    <input placeholder="Search orders..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
            </div> */}

            <div className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.blue}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Booked</span>
                        <div className={styles.valueRow}>
                            <span className={styles.value}>{stats.newOrders}</span>
                        </div>
                    </div>
                    <div className={styles.icon}><BagCheck /></div>
                </div>
                <div className={`${styles.statCard} ${styles.purple}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Ongoing</span>
                        <div className={styles.valueRow}>
                            <span className={styles.value}>{stats.ongoing}</span>
                        </div>
                    </div>
                    <div className={styles.icon}><ClockHistory /></div>
                </div>
                <div className={`${styles.statCard} ${styles.orange}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Completed</span>
                        <div className={styles.valueRow}>
                            <span className={styles.value}>{stats.completed}</span>
                        </div>
                    </div>
                    <div className={styles.icon}><Truck /></div>
                </div>
            </div>

            <div className={styles.contentContainer}>
                <div className={styles.listSection}>
                    <div className={styles.tabsHeader}>
                        <div className={styles.tabs}>
                            {["All Orders", "Booked", "Confirmed", "Worker Assigned", "Worker Reached Location", "Service Ongoing", "Completed", "Cancelled"].map(f => (
                                <button key={f} className={filter === f ? styles.active : ""} onClick={() => setFilter(f)}>
                                    {f}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.tableContainer}>
                        <DataTable
                            columns={columns}
                            data={filteredOrders}
                            loading={loading}
                            onRowClick={(row) => setSelectedOrder(row)}
                        />
                    </div>
                </div>

                {selectedOrder && (
                    <OrderDetails
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onUpdate={handleUpdateStatusLocal}
                    />
                )}
            </div>
        </div>
    );
};

export default OrdersScreen;
