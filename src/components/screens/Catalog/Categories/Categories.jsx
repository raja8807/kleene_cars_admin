import React, { useState, useEffect } from "react";
import styles from "./Categories.module.scss";
import DataTable from "@/components/ui/DataTable/DataTable";
import CustomModal from "@/components/ui/custom_modal/custom_modal";
import CustomInput from "@/components/ui/custom_input/custom_input";
import { supabase } from "@/lib/supabaseClient";
import { Plus, PencilSquare, Trash, CloudUpload } from "react-bootstrap-icons";
import { toast } from "react-toastify";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    // Form State
    const [formData, setFormData] = useState({ name: "", icon: "", image: null });
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch('/api/catalog/categories', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setCategories(data || []);
        } catch (err) {
            toast.error("Failed to fetch categories");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        setEditingCategory(category);
        setFormData({
            name: category?.name || "",
            icon: category?.icon || "", // Keeping it simple str for now
            image: category?.image || null // URL or File
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: "", icon: "", image: null });
    };

    const handleImageUpload = async (file) => {
        if (!file) return null;

        // If it's already a string URL, return it
        if (typeof file === 'string') return file;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `categories/${fileName}`;

        console.log("Uploading category image:", filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('catalog')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error("Category storage error:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('catalog').getPublicUrl(filePath);
        const publicUrl = urlData?.publicUrl;

        if (!publicUrl) {
            throw new Error("Failed to get public URL for category image");
        }

        console.log("Category Public URL:", publicUrl);
        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            let imageUrl = formData.image;

            // Upload only if a new File is selected
            if (formData.image && typeof formData.image !== "string") {
                imageUrl = await handleImageUpload(formData.image);
            }

            const payload = {
                name: formData.name?.trim(),
                icon: formData.icon?.trim(),
                image: imageUrl,
            };

            if (!payload.name) {
                throw new Error("Category name is required");
            }

            const { data: { session } } = await supabase.auth.getSession();
            let response;

            if (editingCategory) {
                response = await fetch('/api/catalog/categories', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ ...payload, id: editingCategory.id })
                });
            } else {
                response = await fetch('/api/catalog/categories', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify(payload)
                });
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save category');
            }

            toast.success(
                editingCategory
                    ? "Category updated successfully"
                    : "Category created successfully"
            );
            await fetchCategories();
            handleCloseModal();
        } catch (err) {
            console.error("Category submission failed:", err);
            toast.error(err.message || "Something went wrong");
        } finally {
            setUploading(false);
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure? This might affect services linked to this category.")) return;

        try {
            const { data: { session } } = await supabase.auth.getSession();
            const response = await fetch(`/api/catalog/categories?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete');
            toast.success("Category deleted");
            setCategories(prev => prev.filter(c => c.id !== id));
        } catch (err) {
            toast.error("Failed to delete");
            console.error(err);
        }
    };

    const columns = [
        {
            label: "Icon", key: "image", render: (row) => (
                row.image ? <img src={row.image} alt={row.name} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />
                    : <span className={styles.iconPreview}>{row.icon || "📁"}</span>
            )
        },
        { label: "Name", key: "name" },
        { label: "ID", key: "id", render: (row) => row.id.toString().slice(0, 6) },
        {
            label: "Actions", key: "actions", render: (row) => (
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className={`${styles.actionBtn} ${styles.edit}`} onClick={(e) => { e.stopPropagation(); handleOpenModal(row); }}>
                        <PencilSquare />
                    </button>
                    <button className={`${styles.actionBtn} ${styles.delete}`} onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }}>
                        <Trash />
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className={styles.categoriesWrapper}>
            <div className={styles.actions}>
                <button onClick={() => handleOpenModal()}>
                    <Plus style={{ fontSize: 20 }} /> Add Category
                </button>
            </div>

            <div className={styles.tableSection}>
                <div className={styles.tableContainer}>
                    <DataTable
                        columns={columns}
                        data={categories}
                        loading={loading}
                    />
                </div>
            </div>

            <CustomModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title={editingCategory ? "Edit Category" : "New Category"}
            >
                <form className={styles.form} onSubmit={handleSubmit}>

                    <div className={styles.imageUpload}>
                        <label>Category Image</label>
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

                    <CustomInput
                        label="Category Name"
                        placeholder="e.g. Car Wash"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <CustomInput
                        label="Icon (Emoji/Text)"
                        placeholder="e.g. 🚗"
                        value={formData.icon}
                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    />

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancel} onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className={styles.submit} disabled={uploading}>
                            {uploading ? "Saving..." : "Save Category"}
                        </button>
                    </div>
                </form>
            </CustomModal>
        </div>
    );
};

export default Categories;
