import React, { useState, useEffect } from "react";
import styles from "./WorkerModal.module.scss";
import { X } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import { useAuth } from "@/components/auth/AuthContext";

const WorkerModal = ({ worker, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        experience: ""
    });
    const [loading, setLoading] = useState(false);
    const { session } = useAuth(); // If we need token for edit later

    useEffect(() => {
        if (worker) {
            setFormData({
                name: worker.name || "",
                phone: worker.phone || "",
                email: worker.email || "",
                experience: worker.experience || ""
            });
        }
    }, [worker]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (worker) {
            // Edit Mode - Handled by parent for now or we can implement update API here too
            // For now, let's keep the local update logic in parent but ideally this should also be an API call
            onSave(formData);
        } else {
            // Create Mode via API
            try {
                setLoading(true);
                const response = await fetch('/api/admin/create-worker', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(formData)
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed to create worker");
                }

                toast.success("Worker created successfully");
                onSave(data); // Pass back success or the new worker data if needed
                onClose();

            } catch (error) {
                console.error("Worker Creation Error:", error);
                toast.error(error.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>{worker ? "Edit Worker" : "Add New Worker"}</h2>
                    <button className={styles.closeBtn} onClick={onClose} disabled={loading}><X /></button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter worker name"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Phone Number</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter 10-digit number"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Email Address</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            required
                            disabled={loading || !!worker} // Disable email edit if updating
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Experience</label>
                        <input
                            name="experience"
                            value={formData.experience}
                            onChange={handleChange}
                            placeholder="e.g. 3 years"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? "Saving..." : (worker ? "Update Worker" : "Add Worker")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkerModal;
