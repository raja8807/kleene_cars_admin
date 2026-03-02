import React, { useState } from "react";
import styles from "./NotificationModal.module.scss";
import CustomModal from "@/components/ui/custom_modal/custom_modal";
import CustomButton from "@/components/ui/custom_button/custom_button";
import notificationService from "@/services/notificationService";
import { toast } from "react-toastify";
import { SendFill } from "react-bootstrap-icons";

const NotificationModal = ({ customer, onClose }) => {
    const [title, setTitle] = useState("Kleene Cars");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!message.trim()) {
            toast.error("Please enter a message");
            return;
        }

        try {
            setLoading(true);
            await notificationService.sendNotification({
                userId: customer.id,
                title: title,
                body: message,
            });
            toast.success("Notification sent successfully");
            onClose();
        } catch (err) {
            console.error(err);
            toast.error(err.message || "Failed to send notification");
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomModal title={`Notify ${customer.full_name || "Customer"}`} onClose={onClose}
            isOpen={customer}
        >
            <div className={styles.container}>
                <div className={styles.formGroup}>
                    <label>Notification Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter title..."
                    />
                </div>
                <div className={styles.formGroup}>
                    <label>Message Content</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={4}
                    />
                </div>

                <div className={styles.footer}>
                    <CustomButton
                        label="Cancel"
                        onClick={onClose}
                        // variant=
                        disabled={loading}
                    >Cancel</CustomButton>
                    <CustomButton
                        // label={loading ? "Sending..." : "Send Notification"}
                        onClick={handleSend}
                        // variant="primary"
                        // icon={<SendFill />}
                        disabled={loading}
                    >Send Notification</CustomButton>
                </div>
            </div>
        </CustomModal>
    );
};

export default NotificationModal;
