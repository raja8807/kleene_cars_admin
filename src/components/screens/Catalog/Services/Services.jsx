import React, { useState, useEffect } from "react";
import styles from "./Services.module.scss";
import DataTable from "@/components/ui/DataTable/DataTable";
import CustomModal from "@/components/ui/custom_modal/custom_modal";
import CustomInput from "@/components/ui/custom_input/custom_input";
import { supabase } from "@/lib/supabaseClient";
import { Plus, PencilSquare, Trash, CloudUpload } from "react-bootstrap-icons";
import { toast } from "react-toastify";

const Services = () => {
    const [services, setServices] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        price: "",
        discount_price: "",
        description: "",
        image: null
    });

    useEffect(() => {
        fetchServices();
        fetchCategories();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('services')
                .select(`*, categories(name)`)
                .order('name');
            if (error) throw error;
            setServices(data || []);
        } catch (err) {
            toast.error("Failed to fetch services");
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        const { data } = await supabase.from('categories').select('id, name');
        setCategories(data || []);
    };

    const handleOpenModal = (service = null) => {
        setEditingService(service);
        setFormData({
            name: service?.name || "",
            category_id: service?.category_id || (categories[0]?.id || ""),
            price: service?.price || "",
            discount_price: service?.discount_price || "",
            description: service?.description || "",
            image: service?.image || null
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingService(null);
    };

    const handleImageUpload = async (file) => {
        if (!file || typeof file === 'string') return file;

        const fileExt = file.name.split('.').pop();
        const fileName = `services/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = fileName;

        console.log("Uploading service image:", filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('catalog')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error("Service storage error:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('catalog').getPublicUrl(filePath);
        const publicUrl = urlData?.publicUrl;

        if (!publicUrl) {
            throw new Error("Failed to get public URL for service image");
        }

        console.log("Service Public URL:", publicUrl);
        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            console.log("Starting service submission...");
            let imageUrl = formData.image;
            if (formData.image && typeof formData.image !== 'string') {
                imageUrl = await handleImageUpload(formData.image);
            }

            const payload = {
                name: formData.name,
                category_id: formData.category_id,
                price: parseFloat(formData.price) || 0,
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                description: formData.description,
                image: imageUrl
            };

            console.log("Service Payload to DB:", payload);

            if (editingService) {
                console.log("Updating service id:", editingService.id);
                const { error } = await supabase
                    .from('services')
                    .update(payload)
                    .eq('id', editingService.id);

                if (error) {
                    console.error("Supabase Update Error:", error);
                    throw error;
                }
                toast.success("Service updated successfully");
            } else {
                console.log("Inserting new service");
                const { error } = await supabase
                    .from('services')
                    .insert([payload]);

                if (error) {
                    console.error("Supabase Insert Error:", error);
                    throw error;
                }
                toast.success("Service created successfully");
            }

            await fetchServices();
            handleCloseModal();

        } catch (err) {
            console.error("Service submission failed:", err);
            toast.error(`Error: ${err.message || 'Operation failed'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const { error } = await supabase.from('services').delete().eq('id', id);
            if (error) throw error;
            toast.success("Service deleted");
            setServices(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const columns = [
        {
            label: "Image", key: "image", render: (row) => (
                row.image ? <img src={row.image} alt={row.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                    : <span className={styles.iconPreview}>🖼️</span>
            )
        },
        { label: "Name", key: "name" },
        { label: "Category", key: "category", render: (row) => row.categories?.name || "-" },
        { label: "Price", key: "price", render: (row) => `₹${row.price}` },
        {
            label: "Actions", key: "actions", render: (row) => (
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className={`${styles.actionBtn} ${styles.edit}`} onClick={() => handleOpenModal(row)}>
                        <PencilSquare />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.delete}`} onClick={() => handleDelete(row.id)}>
                        <Trash />
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className={styles.servicesWrapper}>
            <div className={styles.actions}>
                <button onClick={() => handleOpenModal()}>
                    <Plus style={{ fontSize: 20 }} /> Add Service
                </button>
            </div>

            <div className={styles.tableSection}>
                <div className={styles.tableContainer}>
                    <DataTable
                        columns={columns}
                        data={services}
                        loading={loading}
                    />
                </div>
            </div>

            <CustomModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title={editingService ? "Edit Service" : "New Service"}
            >
                <form className={styles.form} onSubmit={handleSubmit}>

                    <div className={styles.imageUpload}>
                        <label>Service Image</label>
                        <div className={styles.preview}>
                            {formData.image ? (
                                typeof formData.image === 'string' ?
                                    <img src={formData.image} alt="Preview" /> :
                                    <img src={URL.createObjectURL(formData.image)} alt="Preview" />
                            ) : (
                                <span><CloudUpload size={20} /><br />Upload</span>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                            />
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label>Category</label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            required
                        >
                            <option value="" disabled>Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <CustomInput
                        label="Service Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div className={styles.row}>
                        <CustomInput
                            label="Price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            required
                        />
                        <CustomInput
                            label="Discount Price (Optional)"
                            type="number"
                            value={formData.discount_price}
                            onChange={(e) => setFormData({ ...formData, discount_price: e.target.value })}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Description</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancel} onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className={styles.submit} disabled={uploading}>
                            {uploading ? "Saving..." : "Save Service"}
                        </button>
                    </div>
                </form>
            </CustomModal>
        </div>
    );
};

export default Services;
