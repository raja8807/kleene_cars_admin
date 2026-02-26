import React, { useState, useEffect } from "react";
import styles from "./CustomerOrdersModal.module.scss";
import { X, BagCheck } from "react-bootstrap-icons";
import customerService from "@/services/customerService";
import { toast } from "react-toastify";
import OrderDetails from "../Orders/OrderDetails/OrderDetails";

const CustomerOrdersModal = ({ customer, onClose }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (customer) {
            fetchOrders();
        }
    }, [customer]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await customerService.getCustomerOrders(customer.id);
            setOrders(data || []);
        } catch (error) {
            console.error("Failed to fetch customer orders", error);
            toast.error("Failed to load order history");
        } finally {
            setLoading(false);
        }
    };

    const handleOrderUpdate = (id, newStatus, additionalData) => {
        setOrders((prev) =>
            prev.map((o) =>
                o.id === id ? { ...o, status: newStatus, ...additionalData } : o
            )
        );
        // Also update selectedOrder if it's the one that was updated
        if (selectedOrder?.id === id) {
            setSelectedOrder(prev => ({ ...prev, status: newStatus, ...additionalData }));
        }
    };

    if (!customer) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Order History: {customer.full_name}</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X />
                    </button>
                </div>

                <div className={styles.content}>
                    {loading ? (
                        <div className={styles.loading}>Loading order history...</div>
                    ) : orders.length > 0 ? (
                        <div className={styles.tableContainer}>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className={styles.orderRow}
                                            onClick={() => setSelectedOrder(order)}
                                        >
                                            <td className={styles.orderId}>
                                                #{order.order_id || order.id.slice(0, 8)}
                                            </td>
                                            <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                            <td>
                                                <span
                                                    className={`${styles.status} ${styles[order.status?.toLowerCase().replace(/\s+/g, "-")]}`}
                                                >
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td>₹{order.total_amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className={styles.empty}>
                            <BagCheck size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                            <p>No orders found for this customer.</p>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.closeModalBtn} onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>

            {selectedOrder && (
                <OrderDetails
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={handleOrderUpdate}
                />
            )}
        </div>
    );
};

export default CustomerOrdersModal;
