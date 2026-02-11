import React, { useState, useEffect } from "react";
import styles from "./OrderDetails.module.scss";
import {
    X, GeoAlt, Telephone, CarFront, Person, CalendarCheck,
    CreditCard, CheckCircleFill, ExclamationCircleFill, PersonBadge, Bicycle
} from "react-bootstrap-icons";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";

const OrderDetails = ({ order, onClose, onUpdate }) => {
    const [updating, setUpdating] = useState(false);
    const [showWorkerModal, setShowWorkerModal] = useState(false);
    const [workers, setWorkers] = useState([]);
    const [loadingWorkers, setLoadingWorkers] = useState(false);

    useEffect(() => {
        if (showWorkerModal && workers.length === 0) {
            fetchWorkers();
        }
    }, [showWorkerModal]);

    const fetchWorkers = async () => {
        try {
            setLoadingWorkers(true);
            const response = await fetch('/api/workers');
            if (response.ok) {
                const data = await response.json();
                setWorkers(data || []);
            }
        } catch (error) {
            console.error("Failed to fetch workers", error);
        } finally {
            setLoadingWorkers(false);
        }
    };

    if (!order) return null;

    // Helper: Badge Color Class
    const getStatusClass = (status) => {
        const key = status?.toLowerCase().replace(/ /g, "_");
        return styles[key] || "";
    };

    // Helper: Update Status API Call
    const updateOrderStatus = async (newStatus, additionalData = {}) => {
        try {
            setUpdating(true);
            const { data: { session } } = await supabase.auth.getSession();

            const payload = { status: newStatus, ...additionalData };

            const response = await fetch(`/api/orders/${order.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update status');
            }

            toast.success(`Order Updated`);
            // Merge local update for immediate UI reflection
            onUpdate(order.id, newStatus, additionalData);

            // Optionally update local order object if onUpdate doesn't trigger full re-fetch of Parent
            order.status = newStatus;

            // If worker was assigned, layout might need the worker details to show immediately
            // Since API returns the updated order (without joins usually if simple update), we might need to rely on passed data
            if (additionalData.worker_assigned) {
                order.worker_assigned = additionalData.worker_assigned;
            }

        } catch (err) {
            console.error(err);
            toast.error("Failed to update status");
        } finally {
            setUpdating(false);
            setShowWorkerModal(false);
        }
    };

    // Handlers
    const handleAccept = () => {
        updateOrderStatus("Confirmed");
    };

    const handleDecline = () => {
        if (window.confirm("Are you sure you want to decline this order?")) {
            updateOrderStatus("Cancelled");
        }
    };

    const handleAssignWorker = (worker) => {
        // We pass worker_id which triggers the backend logic to insert into worker_assignments
        // We also pass the whole worker object as 'worker_assigned' just for local UI update helper (see updateOrderStatus)
        updateOrderStatus("Worker Assigned", {
            worker_id: worker.id,
            worker_assigned: worker
        });
    };

    const renderActionButtons = () => {
        if (order.status === "Booked") {
            return (
                <div className={styles.actions}>
                    <button className={styles.declineBtn} onClick={handleDecline} disabled={updating}>
                        <X size={20} /> Decline
                    </button>
                    <button className={styles.acceptBtn} onClick={handleAccept} disabled={updating}>
                        <CheckCircleFill /> Accept Order
                    </button>
                </div>
            );
        }

        if (order.status === "Confirmed") {
            return (
                <div className={styles.actions}>
                    <button className={styles.assignBtn} onClick={() => setShowWorkerModal(true)} disabled={updating}>
                        <PersonBadge /> Assign Worker
                    </button>
                </div>
            );
        }

        if (order.status === "Worker Assigned" || order.status === "Worker Reached Location") {
            return (
                <div className={styles.actions}>
                    <button className={styles.secondaryBtn} onClick={() => updateOrderStatus("Service Ongoing")} disabled={updating}>
                        Start Service
                    </button>
                </div>
            );
        }

        if (order.status === "Service Ongoing") {
            return (
                <div className={styles.actions}>
                    <button className={styles.acceptBtn} onClick={() => updateOrderStatus("Completed")} disabled={updating}>
                        Mark Completed
                    </button>
                </div>
            );
        }

        return null; // No actions for Cancelled or Completed (usually)
    };

    return (
        <div className={styles.detailsOverlay}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.titleArea}>
                    <h2>Order Details</h2>
                    <span className={styles.orderId}>#{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <button className={styles.closeBtn} onClick={onClose}><X /></button>
            </div>

            {/* Scrollable Content */}
            <div className={styles.content}>

                {/* Status Banner */}
                <div className={styles.statusBanner}>
                    <span className={styles.label}>Current Status</span>
                    <span className={`${styles.badge} ${getStatusClass(order.status)}`}>
                        {order.status}
                    </span>
                </div>

                {/* Customer Section */}
                <div className={styles.section}>
                    <h3><Person /> Customer Details</h3>
                    <div className={styles.card}>
                        <div className={styles.row}>
                            <span className={styles.label}>Name</span>
                            <span className={styles.value}>{order.users?.full_name || "Guest"}</span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Phone</span>
                            <span className={styles.value}>
                                {order.users?.phone ? <><Telephone size={12} /> {order.users.phone}</> : "N/A"}
                            </span>
                        </div>
                        {order.addresses && (
                            <div className={styles.row}>
                                <span className={styles.label}>Address</span>
                                <span className={styles.value} style={{ textAlign: 'right', fontSize: '13px', lineHeight: '1.4' }}>
                                    {order.addresses.house}, {order.addresses.street},<br />
                                    {order.addresses.area}, {order.addresses.city}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Service Section */}
                <div className={styles.section}>
                    <h3><CarFront /> Service Details</h3>
                    <div className={styles.card}>
                        {order.vehicles && (
                            <div className={styles.row}>
                                <span className={styles.label}>Vehicle</span>
                                <span className={styles.value} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {order.vehicles.type === 'Bike' ? <Bicycle /> : <CarFront />}
                                    {order.vehicles.brand} {order.vehicles.model} ({order.vehicles.number})
                                </span>
                            </div>
                        )}
                        <div className={styles.row}>
                            <span className={styles.label}>Scheduled Date</span>
                            <span className={styles.value}>
                                <CalendarCheck size={14} /> {order.scheduled_date || "Today"}
                            </span>
                        </div>
                        <div className={styles.row}>
                            <span className={styles.label}>Slot Time</span>
                            <span className={styles.value} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                                {order.scheduled_time}
                            </span>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className={styles.card}>
                        <div className={styles.itemList}>
                            {order.order_items?.map((item, i) => (
                                <div key={i} className={styles.item}>
                                    <div className={styles.itemInfo}>
                                        <span className={styles.name}>{item.name}</span>
                                        <span className={styles.type}>{item.item_type}</span>
                                    </div>
                                    <span className={styles.price}>₹{item.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Assigned Worker Section (Show if exists) */}
                {(order.worker_assigned || order.worker) && (
                    <div className={styles.section}>
                        <h3><PersonBadge /> Worker Assigned</h3>
                        <div className={styles.card}>
                            <div className={styles.workerCard}>
                                <div className={styles.avatar}>
                                    <Person />
                                </div>
                                <div className={styles.info}>
                                    <span className={styles.name}>{order.worker_assigned?.name || order.worker?.name || "Assigned Worker"}</span>
                                    <div className={styles.meta}>
                                        <span>⭐ {order.worker_assigned?.rating || "N/A"}</span>
                                        <span>• {order.worker_assigned?.phone || "N/A"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className={styles.footer}>
                <div className={styles.totalRow}>
                    <span>Total Amount</span>
                    <strong>₹{order.total_amount}</strong>
                </div>
                {renderActionButtons()}
            </div>

            {/* Worker Selection Modal */}
            {showWorkerModal && (
                <div className={styles.workerModalOverlay} onClick={() => setShowWorkerModal(false)}>
                    <div className={styles.workerModal} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <span>Select a Worker</span>
                            <button onClick={() => setShowWorkerModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                        </div>
                        <div className={styles.workerList}>
                            {loadingWorkers ? (
                                <div style={{ padding: 20, textAlign: 'center' }}>Loading workers...</div>
                            ) : workers.length > 0 ? (
                                workers.map(worker => (
                                    <div key={worker.id} className={styles.workerItem} onClick={() => handleAssignWorker(worker)}>
                                        <div className={styles.workerInfo}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Person /></div>
                                            <div>
                                                <div className={styles.wName}>{worker.name}</div>
                                                <div className={styles.wMeta}>⭐ {worker.rating || "New"} • {worker.experience || "N/A"}</div>
                                            </div>
                                        </div>
                                        <button className={styles.selectBtn}>Assign</button>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: 20, textAlign: 'center' }}>No active workers found.</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default OrderDetails;
