import React, { useState, useEffect } from "react";
import styles from "./WorkerModal.module.scss";
import { X, CloudUpload } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import { useAuth } from "@/components/auth/AuthContext";
import workerService from "@/services/workerService";
import { supabase } from "@/lib/supabaseClient";

const WorkerModal = ({ worker, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        experience: "",
        password: "",
        id_proof: null,
        id_proof_url: ""
    });
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const { session } = useAuth(); // If we need token for edit later

    useEffect(() => {
        if (worker) {
            setFormData({
                name: worker.name || "",
                phone: worker.phone || "",
                email: worker.email || "",
                experience: worker.experience || "",
                id_proof_url: worker.id_proof_url || ""
            });
        }
    }, [worker]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "id_proof") {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleIdProofUpload = async (file) => {
        if (!file) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `workers/id_proofs/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = fileName;

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('catalog') // Using catalog bucket as it's already configured
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('catalog').getPublicUrl(filePath);
        return urlData?.publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (worker) {
            onSave(formData);
        } else {
            // Create Mode via API
            try {
                setLoading(true);
                setUploading(true);

                let idProofUrl = null;
                if (formData.id_proof) {
                    idProofUrl = await handleIdProofUpload(formData.id_proof);
                }

                const payload = {
                    name: formData.name,
                    phone: formData.phone,
                    email: formData.email,
                    experience: formData.experience,
                    password: formData.password,
                    id_proof_url: idProofUrl
                };

                const data = await workerService.createWorker(payload);
                toast.success("Worker created successfully");
                onSave(data);
                onClose();

            } catch (error) {
                console.error("Worker Creation Error:", error);
                toast.error(error.message || "Failed to create worker");
            } finally {
                setLoading(false);
                setUploading(false);
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

                    {!worker && (
                        <div className={styles.formGroup}>
                            <label>Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Set worker password"
                                required
                                disabled={loading}
                            />
                        </div>
                    )}

                    {!worker && (
                        <div className={styles.imageUpload}>
                            <label>ID Proof</label>
                            <div className={styles.preview}>
                                {formData.id_proof ? (
                                    <img src={URL.createObjectURL(formData.id_proof)} alt="Preview" />
                                ) : (
                                    <span><CloudUpload size={20} /><br />Upload ID Proof</span>
                                )}
                                <input
                                    name="id_proof"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>
                        </div>
                    )}

                    {worker && formData.id_proof_url && (
                        <div className={styles.imageUpload}>
                            <label>ID Proof (Existing)</label>
                            <div className={styles.preview} onClick={() => window.open(formData.id_proof_url, '_blank')}>
                                <img src={formData.id_proof_url} alt="ID Proof" title="Click to view full size" />
                            </div>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <button type="button" className={styles.cancelBtn} onClick={onClose} disabled={loading}>Cancel</button>
                        <button type="submit" className={styles.saveBtn} disabled={loading || uploading}>
                            {uploading ? "Uploading..." : (loading ? "Saving..." : (worker ? "Update Worker" : "Add Worker"))}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkerModal;
