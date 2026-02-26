import React, { useState, useEffect } from "react";
import styles from "./OrderDetails.module.scss";
import {
  X,
  Telephone,
  CarFront,
  Person,
  CalendarCheck,
  CheckCircleFill,
  PersonBadge,
  Bicycle,
  XCircleFill,
  GeoAlt,
} from "react-bootstrap-icons";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import orderService from "@/services/orderService";
import workerService from "@/services/workerService";
import CustomButton from "@/components/ui/custom_button/custom_button";

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
      const data = await workerService.getAllWorkers();
      setWorkers(data || []);
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
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const payload = { status: newStatus, ...additionalData };

      await orderService.updateOrder(order?.id, payload);
      // const response = await fetch... // Removed

      toast.success(`Order Updated`);
      // Merge local update for immediate UI reflection
      onUpdate(order?.id, newStatus, additionalData);

      // Optionally update local order object if onUpdate doesn't trigger full re-fetch of Parent
      order.status = newStatus;

      // If worker was assigned, layout might need the worker details to show immediately
      // Since API returns the updated order (without joins usually if simple update), we might need to rely on passed data
      if (additionalData.WorkerAssigned) {
        order.WorkerAssigned = additionalData.WorkerAssigned;
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
    // We also pass the whole worker object as 'WorkerAssigned' just for local UI update helper (see updateOrderStatus)
    updateOrderStatus("Worker Assigned", {
      worker_id: worker.id,
      WorkerAssigned: worker,
    });
  };

  const renderActionButtons = () => {
    if (order?.status === "Booked") {
      return (
        <div className={styles.actions}>
          <button
            className={styles.declineBtn}
            onClick={handleDecline}
            disabled={updating}
          >
            <X size={20} /> Decline
          </button>
          <button
            className={styles.acceptBtn}
            onClick={handleAccept}
            disabled={updating}
          >
            <CheckCircleFill /> Accept Order
          </button>
        </div>
      );
    }

    if (order?.status === "Confirmed") {
      return (
        <div className={styles.actions}>
          <button
            className={styles.assignBtn}
            onClick={() => setShowWorkerModal(true)}
            disabled={updating}
          >
            <PersonBadge /> Assign Worker
          </button>
        </div>
      );
    }

    if (
      order?.status === "Worker Assigned" ||
      order?.status === "Worker Reached Location"
    ) {
      return (
        <div className={styles.actions}>
          <button
            className={styles.secondaryBtn}
            onClick={() => updateOrderStatus("Service Ongoing")}
            disabled={updating}
          >
            Start Service
          </button>
        </div>
      );
    }

    if (order?.status === "Service Ongoing") {
      return (
        <div className={styles.actions}>
          <button
            className={styles.acceptBtn}
            onClick={() => updateOrderStatus("Completed")}
            disabled={updating}
          >
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
          <span className={styles.orderId}>
            #{order?.id.slice(0, 8).toUpperCase()}
          </span>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>
          <X />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className={styles.content}>
        {/* Status Banner */}
        <div className={styles.statusBanner}>
          <span className={styles.label}>Current Status</span>
          <span className={`${styles.badge} ${getStatusClass(order?.status)}`}>
            {order?.status}
          </span>
        </div>

        {/* Customer Section */}
        <div className={styles.section}>
          <h3>
            <Person /> Customer Details
          </h3>
          <div className={styles.card}>
            <div className={styles.row}>
              <span className={styles.label}>Name</span>
              <span className={styles.value}>
                {order?.User?.full_name || "Guest"}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Phone</span>
              <span className={styles.value}>
                {order?.User?.phone ? (
                  <>
                    <Telephone size={12} /> {order?.User.phone}
                  </>
                ) : (
                  "N/A"
                )}
              </span>
            </div>
            {order?.Address && (
              <div className={styles.row}>
                <span className={styles.label}>Address</span>
                <span
                  className={styles.value}
                  style={{
                    textAlign: "right",
                    fontSize: "13px",
                    lineHeight: "1.4",
                  }}
                >
                  {order?.Address.house}, {order?.Address.street},<br />
                  {order?.Address.area}, {order?.Address.city}
                </span>
              </div>
            )}
            <CustomButton
              onClick={() => {
                const latitude = order?.Address?.latitude;
                const longitude = order?.Address?.longitude;

                if (latitude && longitude) {
                  const googleMapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
                  window.open(googleMapsUrl, "_blank");
                } else {
                  alert("Location not available");
                }
              }}
            >
              Open location in map
              <GeoAlt />
            </CustomButton>
          </div>
        </div>

        {/* Service Section */}
        <div className={styles.section}>
          <h3>
            <CarFront /> Service Details
          </h3>
          <div className={styles.card}>
            {order?.Vehicle && (
              <div className={styles.row}>
                <span className={styles.label}>Vehicle</span>
                <span
                  className={styles.value}
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  {order?.Vehicle.type === "Bike" ? <Bicycle /> : <CarFront />}
                  {order?.Vehicle.brand} {order?.Vehicle.model} (
                  {order?.Vehicle.number})
                </span>
              </div>
            )}
            <div className={styles.row}>
              <span className={styles.label}>Scheduled Date</span>
              <span className={styles.value}>
                <CalendarCheck size={14} /> {order?.scheduled_date || "Today"}
              </span>
            </div>
            <div className={styles.row}>
              <span className={styles.label}>Slot Time</span>
              <span
                className={styles.value}
                style={{ color: "var(--color-primary)", fontWeight: 600 }}
              >
                {order?.scheduled_time}
              </span>
            </div>
          </div>

          {/* Items List */}
          <div className={styles.card}>
            <div className={styles.itemList}>
              {order?.OrderItems?.map((item, i) => (
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

          {/* Additional Details */}

          <div className={styles.card}>
            <div className={styles.itemList}>
              <div className={styles.item}>
                <div className={styles.itemInfo}>
                  <span
                    className={styles.name}
                    style={{
                      marginBottom: "16px",
                    }}
                  >
                    {order?.water_available ? (
                      <CheckCircleFill
                        size={18}
                        color="green"
                        style={{
                          marginRight: "10px",
                        }}
                      />
                    ) : (
                      <XCircleFill
                        size={18}
                        color="red"
                        style={{
                          marginRight: "10px",
                        }}
                      />
                    )}
                    Water Available
                  </span>

                  <span className={styles.name}>
                    {order?.water_available ? (
                      <CheckCircleFill
                        size={18}
                        color="green"
                        style={{
                          marginRight: "10px",
                        }}
                      />
                    ) : (
                      <XCircleFill
                        size={18}
                        color="red"
                        style={{
                          marginRight: "10px",
                        }}
                      />
                    )}
                    Electricity Available
                  </span>
                </div>
              </div>

              <small>Additional Notes</small>
              <p>{order?.additional_notes}</p>
            </div>
          </div>
        </div>

        {/* Assigned Worker Section (Show if exists) */}
        {order?.WorkerAssigned && (
          <div className={styles.section}>
            <h3>
              <span><PersonBadge /> Worker Assigned</span>
              <button
                className={styles.changeWorkerBtn}
                onClick={() => setShowWorkerModal(true)}
                disabled={updating}
              >
                Change
              </button>
            </h3>
            <div className={styles.card}>
              <div className={styles.workerCard}>
                <div className={styles.avatar}>
                  <Person />
                </div>
                <div className={styles.info}>
                  <span className={styles.name}>
                    {order?.WorkerAssigned?.name ||
                      order?.worker?.name ||
                      "Assigned Worker"}
                  </span>
                  <div className={styles.meta}>
                    <span>⭐ {order?.WorkerAssigned?.rating || "N/A"}</span>
                    <span>• {order?.WorkerAssigned?.phone || "N/A"}</span>
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
          <strong>₹{order?.total_amount}</strong>
        </div>
        {renderActionButtons()}
      </div>

      {/* Worker Selection Modal */}
      {showWorkerModal && (
        <div
          className={styles.workerModalOverlay}
          onClick={() => setShowWorkerModal(false)}
        >
          <div
            className={styles.workerModal}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <span>Select a Worker</span>
              <button
                onClick={() => setShowWorkerModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div className={styles.workerList}>
              {loadingWorkers ? (
                <div style={{ padding: 20, textAlign: "center" }}>
                  Loading workers...
                </div>
              ) : workers.length > 0 ? (
                workers.map((worker) => (
                  <div
                    key={worker.id}
                    className={styles.workerItem}
                    onClick={() => handleAssignWorker(worker)}
                  >
                    <div className={styles.workerInfo}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: "#eee",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Person />
                      </div>
                      <div>
                        <div className={styles.wName}>{worker.name}</div>
                        <div className={styles.wMeta}>
                          ⭐ {worker.rating || "New"} •{" "}
                          {worker.experience || "N/A"}
                        </div>
                      </div>
                    </div>
                    <button className={styles.selectBtn}>Assign</button>
                  </div>
                ))
              ) : (
                <div style={{ padding: 20, textAlign: "center" }}>
                  No active workers found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;
