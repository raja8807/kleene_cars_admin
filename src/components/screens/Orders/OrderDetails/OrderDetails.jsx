import React, { useState } from "react";
import styles from "./OrderDetails.module.scss";
import { X, GeoAlt, Telephone, CarFront } from "react-bootstrap-icons";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

const OrderDetails = ({ order, onClose, onUpdate }) => {
    const [updating, setUpdating] = useState(false);

    if (!order) return null;

    const handleStatusUpdate = async (newStatus) => {
        try {
            setUpdating(true);
            const { error } = await supabase
                .from('orders')
                .update({ status: newStatus })
                .eq('id', order.id);

            if (error) throw error;
            toast.success(`Order status updated to ${newStatus}`);
            onUpdate(order.id, newStatus);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className={styles.detailsOverlay}>
            <div className={styles.header}>
                <h2>Order Details</h2>
                <button className={styles.closeBtn} onClick={onClose}><X /></button>
            </div>

            <div className={styles.content}>
                {/* ID and Date */}
                <div className={styles.section}>
                    <div className={styles.card}>
                        <div className={styles.row}>
                            <span className={styles.label}>Order ID</span>
                            <span className={styles.value}>#{order.id.toString().slice(0, 8)}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Placed On</span>
                            <span className={styles.value}>{new Date(order.created_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Information */}
                <div className={styles.section}>
                    <h3>Customer Information</h3>
                    <div className={styles.card}>
                        <div className={styles.row}>
                            <span className={styles.label}>Name</span>
                            <span className={styles.value}>{order.users?.full_name || "Guest User"}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Email</span>
                            <span className={styles.value}>{order.users?.email || "N/A"}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Phone</span>
                            <span className={styles.value}><Telephone /> {order.users?.phone || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Vehicle Details */}
                {order.vehicles && (
                    <div className={styles.section}>
                        <h3>Vehicle Details</h3>
                        <div className={styles.card}>
                            <div className={styles.row}>
                                <span className={styles.label}>Vehicle</span>
                                <span className={styles.value}><CarFront /> {order.vehicles.brand} {order.vehicles.model}</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>Number Slot</span>
                                <span className={styles.value}>{order.vehicles.number}</span>
                            </div>
                            <div className={styles.row}>
                                <span className={styles.label}>Type</span>
                                <span className={styles.value}>{order.vehicles.type}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Address */}
                {order.addresses && (
                    <div className={styles.section}>
                        <h3>Service Address</h3>
                        <div className={styles.card}>
                            <div className={styles.row}>
                                <span className={styles.label}><GeoAlt /> Address</span>
                                <span className={styles.value} style={{ textAlign: "right" }}>
                                    {order.addresses.house}, {order.addresses.street}<br />
                                    {order.addresses.area}, {order.addresses.city}<br />
                                    {order.addresses.pincode}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className={styles.section}>
                    <h3>Order Items</h3>
                    <div className={styles.itemList}>
                        {order.order_items?.map((item, idx) => (
                            <div key={idx} className={styles.item}>
                                <div className={styles.info}>
                                    <span className={styles.name}>{item.name}</span>
                                    <span className={styles.type}>{item.item_type || "Item"}</span>
                                </div>
                                <span className={styles.price}>${item.price}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.footer}>
                <div className={styles.totalRow}>
                    <span>Total Amount</span>
                    <strong>${order.total_amount}</strong>
                </div>

                <div className={styles.statusUpdate}>
                    <label>Update Order Status</label>
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(e.target.value)}
                        disabled={updating}
                    >
                        <option value="Pending">Pending</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
