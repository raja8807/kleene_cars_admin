import React, { useState, useEffect } from "react";
import styles from "./Banners.module.scss";
import CustomModal from "@/components/ui/custom_modal/custom_modal";
import CustomInput from "@/components/ui/custom_input/custom_input";
import { supabase } from "@/lib/supabaseClient";
import { Plus, Trash, Image as ImageIcon, CloudUpload } from "react-bootstrap-icons";
import catalogService from "@/services/catalogService";
import { toast } from "react-toastify";

const Banners = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState({ title: "", image: null });

    useEffect(() => {
        fetchBanners();
    }, []);

    const fetchBanners = async () => {
        try {
            setLoading(true);
            const data = await catalogService.getBanners();
            setBanners(data || []);
        } catch (err) {
            toast.error("Failed to fetch banners");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({ title: "", image: null });
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleImageUpload = async (file) => {
        if (!file) return null;

        const fileExt = file.name.split('.').pop();
        const fileName = `banners/${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = fileName;

        console.log("Uploading file to storage:", filePath);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('catalog')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (uploadError) {
            console.error("Storage upload error:", uploadError);
            throw new Error(`Upload failed: ${uploadError.message} `);
        }

        console.log("Upload success:", uploadData);

        const { data: urlData } = supabase.storage.from('catalog').getPublicUrl(filePath);
        const publicUrl = urlData?.publicUrl;

        if (!publicUrl) {
            throw new Error("Failed to get public URL for the uploaded image");
        }

        console.log("Generated Public URL:", publicUrl);
        return publicUrl;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.image) {
            toast.warning("Image is required");
            return;
        }
        setUploading(true);

        try {
            console.log("Starting banner submission...");
            const imageUrl = await handleImageUpload(formData.image);

            const payload = {
                title: formData.title || "Banner",
                image: imageUrl
            };

            const newBanner = await catalogService.createBanner({
                title: formData.title,
                image_url: imageUrl, // Changed publicUrl to imageUrl
                link: formData.link
            });

            toast.success("Banner created successfully");
            await fetchBanners();
            handleCloseModal();

        } catch (err) {
            console.error("Submission failed:", err);
            toast.error(`Error: ${err.message || "Operation failed"} `);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this banner?")) return;
        try {
            await catalogService.deleteBanner(id);


            toast.success("Banner deleted");
            setBanners(prev => prev.filter(b => b.id !== id));
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className={styles.bannersWrapper}>
            <div className={styles.actions}>
                <button onClick={handleOpenModal}>
                    <Plus style={{ fontSize: 20 }} /> Add Banner
                </button>
            </div>

            <div className={styles.grid}>
                {banners.map(banner => (
                    <div key={banner.id} className={styles.bannerCard}>
                        <div className={styles.image}>
                            <img src={banner.image} alt={banner.title} />
                        </div>
                        <div className={styles.info}>
                            <span>{banner.title}</span>
                            <button onClick={() => handleDelete(banner.id)}><Trash /></button>
                        </div>
                    </div>
                ))}
                {!loading && banners.length === 0 && <p style={{ textAlign: 'center', width: '100%', color: '#888' }}>No banners found.</p>}
            </div>

            <CustomModal
                isOpen={modalOpen}
                onClose={handleCloseModal}
                title="New Banner"
            >
                <form className={styles.form} onSubmit={handleSubmit}>

                    <div className={styles.imageUpload}>
                        <label>Banner Image</label>
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
                                required
                            />
                        </div>
                    </div>

                    <CustomInput
                        label="Title (Optional)"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />

                    <div className={styles.actions}>
                        <button type="button" className={styles.cancel} onClick={handleCloseModal}>Cancel</button>
                        <button type="submit" className={styles.submit} disabled={uploading}>
                            {uploading ? "Saving..." : "Save Banner"}
                        </button>
                    </div>
                </form>
            </CustomModal>
        </div>
    );
};

export default Banners;
