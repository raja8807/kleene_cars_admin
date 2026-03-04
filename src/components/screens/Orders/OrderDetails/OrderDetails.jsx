import React, { useState, useEffect } from "react";
import { calculateOrderPrice } from "@/utils/priceHelpers";
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
  CurrencyRupee,
} from "react-bootstrap-icons";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-toastify";
import orderService from "@/services/orderService";
import workerService from "@/services/workerService";
import CustomButton from "@/components/ui/custom_button/custom_button";
import { Image } from "react-bootstrap";
import paymentService from "@/services/paymentService";

const OrderDetails = ({ order, onClose, onUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [showWorkerModal, setShowWorkerModal] = useState(false);
  const [workers, setWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [payment, setPayment] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    if (order?.id) {
      fetchPayment();
    }
  }, [order?.id]);

  const fetchPayment = async () => {
    try {
      setLoadingPayment(true);
      const data = await paymentService.getPaymentByOrderId(order.id);
      setPayment(data);
    } catch (error) {
      console.error("Failed to fetch payment", error);
    } finally {
      setLoadingPayment(false);
    }
  };

  const evidence = order?.OrderEvidences || [];
  const beforeImages = evidence.filter((e) => e.evidence_type === "before");
  const afterImages = evidence.filter((e) => e.evidence_type === "after");

  useEffect(() => {
    if (showWorkerModal && workers.length === 0) {
      fetchWorkers();
    }
  }, [showWorkerModal]);

  const fetchWorkers = async () => {
    try {
      setLoadingWorkers(true);
      const data = await workerService.getAllWorkers({
        date: order.scheduled_date,
        time: order.scheduled_time,
        status: "Active",
      });
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

  const handleAssignWorker = async (worker) => {
    setAssigning(true);
    try {
      await updateOrderStatus("Worker Assigned", {
        worker_id: worker.id,
        WorkerAssigned: worker,
      });
    } catch (error) {
      console.log(error);
      alert("Something went wrong while assigning worker");
    } finally {
      setAssigning(false);
    }
  };

  // Helper: Calculate Price Breakdown
  const { subtotal, resourceCharges, totalAmount } = calculateOrderPrice(order);

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

  const renderEvidence = (title, images) => {
    if (images.length === 0) return null;
    return (
      <div className={styles.evidenceSection}>
        <h4>{title}</h4>
        <div className={styles.imageGrid}>
          {images.map((img, idx) => (
            <div
              key={idx}
              className={styles.imageWrapper}
              onClick={() => window.open(img.image_url, "_blank")}
            >
              <Image fluid src={img.image_url} alt={`${title} ${idx + 1}`} />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
                <CalendarCheck size={14} />{" "}
                {formatDate(order?.scheduled_date) || "Today"}
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
                <div
                  key={i}
                  className={styles.item}
                  style={{ flexDirection: "column", alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      alignItems: "center",
                    }}
                  >
                    <div className={styles.itemInfo}>
                      <span className={styles.name}>
                        {item.name}{" "}
                        {item.quantity > 1 ? `x ${item.quantity}` : ""}
                      </span>
                      <span className={styles.type}>{item.item_type}</span>
                    </div>
                    <span className={styles.price}>
                      ₹
                      {(item.ServiceDetail?.discount_price || item.price) *
                        (item.quantity || 1)}
                    </span>
                  </div>

                  {item.item_type === "service" &&
                    (item.ServiceDetail?.water_required ||
                      item.ServiceDetail?.electricity_required) && (
                      <div className={styles.resourceList}>
                        {item.ServiceDetail?.water_required && (
                          <div
                            className={`${styles.resourceBadge} ${item.water_available ? styles.available : styles.notAvailable}`}
                          >
                            <span>
                              {item.water_available ? (
                                <CheckCircleFill size={14} />
                              ) : (
                                <XCircleFill size={14} />
                              )}
                              Water
                            </span>{" "}
                            <p>
                              {!item.water_available &&
                                item.ServiceDetail?.water_price > 0 &&
                                `+₹${item.ServiceDetail.water_price}`}
                            </p>
                          </div>
                        )}

                        {item.ServiceDetail?.electricity_required && (
                          <div
                            className={`${styles.resourceBadge} ${item.electricity_available ? styles.available : styles.notAvailable}`}
                          >
                            <span>
                              {item.electricity_available ? (
                                <CheckCircleFill size={14} />
                              ) : (
                                <XCircleFill size={14} />
                              )}
                              Electricity
                            </span>{" "}
                            <p>
                              {!item.electricity_available &&
                                item.ServiceDetail?.electricity_price > 0 &&
                                `+₹${item.ServiceDetail.electricity_price}`}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional Details */}

          <div className={styles.card}>
            <div className={styles.itemList}>
              <small>Additional Notes</small>
              <p>{order?.additional_notes || "None"}</p>
            </div>
          </div>
        </div>

        {/* Assigned Worker Section (Show if exists) */}
        {order?.WorkerAssigned && (
          <div className={styles.section}>
            <h3>
              <span>
                <PersonBadge /> Worker Assigned
              </span>
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

        {/* Payment Details Section */}
        {payment && (
          <div className={styles.section}>
            <h3>
              <CurrencyRupee /> Payment Details
              <span
                className={`${styles.statusBadge} ${styles[payment.status?.toLowerCase()]}`}
                style={{ marginLeft: "12px", verticalAlign: "middle" }}
              >
                {payment.status}
              </span>
            </h3>
            <div className={styles.card}>
              <div className={styles.paymentItems}>
                {payment.PaymentItems?.map((item, idx) => (
                  <div key={idx} className={styles.row}>
                    <span className={styles.label}>
                      {item.name} x {item.quantity}
                    </span>
                    <span className={styles.value}>
                      ₹{parseFloat(item.price) * item.quantity}
                    </span>
                  </div>
                ))}
              </div>
              <div
                className={styles.row}
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: "12px",
                  marginTop: "8px",
                }}
              >
                <span className={styles.label} style={{ fontWeight: "bold" }}>
                  Total Paid
                </span>
                <span className={`${styles.value} ${styles.successAmount}`}>
                  ₹
                  {payment.PaymentItems?.reduce(
                    (sum, item) => sum + parseFloat(item.price) * item.quantity,
                    0,
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Evidence Section */}
        {(beforeImages.length > 0 || afterImages.length > 0) && (
          <div className={styles.section}>
            <h3>Evidence Photos</h3>
            <div className={styles.card}>
              {renderEvidence("Before Service", beforeImages)}
              {renderEvidence("After Service", afterImages)}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className={styles.footer}>
        <div className={styles.billBreakdown}>
          <div className={styles.billRow}>
            <span>Items Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          {resourceCharges > 0 && (
            <div className={styles.billRow}>
              <span>Resource Charges</span>
              <span className={styles.charge}>+₹{resourceCharges}</span>
            </div>
          )}
        </div>
        <div className={styles.totalRow}>
          <span>Total Amount</span>
          <strong>₹{totalAmount}</strong>
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
              {assigning && <div className={styles.assigning}>Assigning..</div>}
              {loadingWorkers ? (
                <div style={{ padding: 20, textAlign: "center" }}>
                  Loading workers...
                </div>
              ) : workers.length > 0 ? (
                workers.map((worker) => (
                  <div
                    key={worker.id}
                    className={`${styles.workerItem} ${worker.is_busy ? styles.busy : ""}`}
                    onClick={() =>
                      !worker.is_busy && handleAssignWorker(worker)
                    }
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
                          opacity: worker.is_busy ? 0.5 : 1,
                        }}
                      >
                        <Person />
                      </div>
                      <div style={{ opacity: worker.is_busy ? 0.5 : 1 }}>
                        <div className={styles.wName}>
                          {worker.name}
                          {worker.is_busy && (
                            <span className={styles.busyLabel}> (Busy)</span>
                          )}
                        </div>
                        <div className={styles.wMeta}>
                          ⭐ {worker.rating || "New"} •{" "}
                          {worker.experience || "N/A"}
                        </div>
                      </div>
                    </div>
                    <button
                      className={styles.selectBtn}
                      disabled={worker.is_busy}
                    >
                      {worker.is_busy ? "Busy" : "Assign"}
                    </button>
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
