import React, { useEffect } from "react";
import styles from "./custom_modal.module.scss";

const CustomModal = ({ isOpen, onClose, title, children }) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>{title}</h3>
                    <button className={styles.closeBtn} onClick={onClose}>&times;</button>
                </div>
                <div className={styles.content}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default CustomModal;
