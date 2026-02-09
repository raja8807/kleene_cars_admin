import React, { useState, useEffect } from "react";
import styles from "./Products.module.scss";
import DataTable from "@/components/ui/DataTable/DataTable";
import CustomModal from "@/components/ui/custom_modal/custom_modal";
import CustomInput from "@/components/ui/custom_input/custom_input";
import { supabase } from "@/lib/supabaseClient";
import { Plus, PencilSquare, Trash, CloudUpload } from "react-bootstrap-icons";
import { toast } from "react-toastify";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        price: "",
        discount_price: "",
        description: "",
        image: null
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('name');
            if (error) throw error;
            setProducts(data || []);
        } catch (err) {
            toast.error("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (product = null) => {
        setEditingProduct(product);
        setFormData({
            name: product?.name || "",
            price: product?.price || "",
            discount_price: product?.discount_price || "",
            description: product?.description || "",
            image: product?.image || null
        });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    const handleImageUpload = async (file) => {
        if (!file || typeof file === 'string') return file;

        const fileExt = file.name.split('.').pop();
        const fileName = `products/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = fileName;

        console.log("Uploading product image:", filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('catalog')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error("Product storage error:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage.from('catalog').getPublicUrl(filePath);
        const publicUrl = urlData?.publicUrl;

        if (!publicUrl) {
            throw new Error("Failed to get public URL for product image");
        }

        console.log("Product Public URL:", publicUrl);
        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);

        try {
            console.log("Starting product submission...");
            let imageUrl = formData.image;
            if (formData.image && typeof formData.image !== 'string') {
                imageUrl = await handleImageUpload(formData.image);
            }

            const payload = {
                name: formData.name,
                price: parseFloat(formData.price) || 0,
                discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
                description: formData.description,
                image: imageUrl
            };

            console.log("Product Payload to DB:", payload);

            if (editingProduct) {
                console.log("Updating product id:", editingProduct.id);
                const { error } = await supabase
                    .from('products')
                    .update(payload)
                    .eq('id', editingProduct.id);

                if (error) {
                    console.error("Supabase Update Error:", error);
                    throw error;
                }
                toast.success("Product updated successfully");
            } else {
                console.log("Inserting new product");
                const { error } = await supabase
                    .from('products')
                    .insert([payload]);

                if (error) {
                    console.error("Supabase Insert Error:", error);
                    throw error;
                }
                toast.success("Product created successfully");
            }

            await fetchProducts();
            handleCloseModal();

        } catch (err) {
            console.error("Product submission failed:", err);
            toast.error(`Error: ${err.message || 'Operation failed'}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            toast.success("Product deleted");
            setProducts(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    const columns = [
        {
            label: "Image", key: "image", render: (row) => (
                row.image ? <img src={row.image} alt={row.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                    : <span className={styles.iconPreview}>📦</span>
            )
        },
        { label: "Name", key: "name" },
        { label: "Price", key: "price", render: (row) => `$${row.price}` },
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
        <div className={styles.productsWrapper}>
            <div className={styles.actions}>
                <button onClick={() => handleOpenModal()}>
                    <Plus style={{ fontSize: 20 }} /> Add Product
                </button>
            </div>

            <div className={styles.tableSection}>
                <div className={styles.tableContainer}>
                    <DataTable
                        columns={columns}
                        data={products}
                        loading={loading}
                    />
                </div>
            </div>

            <CustomModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title={editingProduct ? "Edit Product" : "New Product"}
            >
                <form className={styles.form} onSubmit={handleSubmit}>

                    <div className={styles.imageUpload}>
                        <label>Product Image</label>
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
                        label="Product Name"
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
                            {uploading ? "Saving..." : "Save Product"}
                        </button>
                    </div>
                </form>
            </CustomModal>
        </div>
    );
};

export default Products;
