import React, { useState, useEffect } from "react";
import styles from "./AdminModal.module.scss";
import { X } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import adminService from "@/services/adminService";

const AdminModal = ({ admin, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (admin) {
            setFormData({
                name: admin.full_name || "",
                phone: admin.phone || "",
                email: admin.email || "",
                password: "" // Don't pre-fill password
            });
        }
    }, [admin]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            if (admin) {
                // Update
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;

                await adminService.updateSubAdmin(admin.id, updateData);
                toast.success("Sub-admin updated successfully");
            } else {
                // Create
                await adminService.createSubAdmin(formData);
                toast.success("Sub-admin created successfully");
            }
            onSave();
            onClose();
        } catch (error) {
            console.error("Admin Operation Error:", error);
            toast.error(error.message || `Failed to ${admin ? 'update' : 'create'} sub-admin`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>{admin ? "Edit Sub-Admin" : "Add New Sub-Admin"}</h2>
                    <button className={styles.closeBtn} onClick={onClose} disabled={loading}><X /></button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label>Full Name</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter name"
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
                            placeholder="Enter phone number"
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
                            disabled={loading || !!admin}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>{admin ? "New Password (Optional)" : "Password"}</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder={admin ? "Leave blank to keep current" : "Set password"}
                            required={!admin}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className={styles.saveBtn} disabled={loading}>
                            {loading ? "Saving..." : (admin ? "Update Admin" : "Add Admin")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminModal;
