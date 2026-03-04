import React, { useState, useEffect } from "react";
import styles from "./Customers.module.scss";
import DataTable from "@/components/ui/DataTable/DataTable";
import { supabase } from "@/lib/supabaseClient";
import customerService from "@/services/customerService";
import { Search, Eye, Bell } from "react-bootstrap-icons";
import { toast } from "react-toastify";
import CustomerOrdersModal from "./CustomerOrdersModal";
import NotificationModal from "./NotificationModal";
import { useRefresh } from "@/context/RefreshContext";

const CustomersScreen = () => {
    const { refreshKey } = useRefresh();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [notifyCustomer, setNotifyCustomer] = useState(null);

    useEffect(() => {
        fetchUsers(currentPage);
    }, [currentPage, refreshKey]);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            // const { data: { session } } = await supabase.auth.getSession(); // Removed as customerService handles it

            // Replaced fetch with customerService.getAllCustomers
            const data = await customerService.getAllCustomers(page);

            setUsers(data.data || []);
            setPagination({
                totalItems: data.totalItems,
                totalPages: data.totalPages
            });
        } catch (err) {
            console.error(err);
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.includes(searchQuery)
    );

    const columns = [
        { label: "Name", key: "full_name", render: (row) => row.full_name || "Unknown" },
        { label: "Email", key: "email" },
        { label: "Phone", key: "phone", render: (row) => row.phone || "-" },
        { label: "Joined", key: "created_at", render: (row) => new Date(row.created_at).toLocaleDateString() },
        {
            label: "Actions",
            key: "actions",
            render: (row) => (
                <div style={{ display: "flex", gap: "8px" }}>
                    <button
                        style={{
                            padding: "6px 12px",
                            backgroundColor: "var(--color-bg-tertiary)",
                            border: "1px solid var(--color-divider)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                            color: "var(--color-text-primary)"
                        }}
                        onClick={() => setSelectedCustomer(row)}
                    >
                        <Eye size={14} /> View Orders
                    </button>
                    <button
                        style={{
                            padding: "6px 12px",
                            backgroundColor: "rgba(var(--color-primary-rgb), 0.1)",
                            border: "1px solid var(--color-primary)",
                            borderRadius: "4px",
                            fontSize: "12px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            cursor: "pointer",
                            color: "var(--color-primary)"
                        }}
                        onClick={() => setNotifyCustomer(row)}
                    >
                        <Bell size={14} /> Notify
                    </button>
                </div>
            )
        },
    ];

    return (
        <div className={styles.customersWrapper}>
            <div className={styles.subHeader}>
                <div className={styles.actions}>
                    <div className={styles.search}>
                        <Search color="#888" />
                        <input
                            type="text"
                            placeholder="Search customers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.tableSection}>
                <div className={styles.tableContainer}>
                    <DataTable
                        columns={columns}
                        data={filteredUsers}
                        loading={loading}
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={(page) => setCurrentPage(page)}
                    />
                </div>
            </div>

            {selectedCustomer && (
                <CustomerOrdersModal
                    customer={selectedCustomer}
                    onClose={() => setSelectedCustomer(null)}
                />
            )}

            {notifyCustomer && (
                <NotificationModal
                    customer={notifyCustomer}
                    onClose={() => setNotifyCustomer(null)}
                />
            )}
        </div>
    );
};

export default CustomersScreen;
