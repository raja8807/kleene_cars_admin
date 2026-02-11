import React, { useState, useEffect } from "react";
import styles from "./Customers.module.scss";
import DataTable from "@/components/ui/DataTable/DataTable";
import { supabase } from "@/lib/supabaseClient";
import { Search } from "react-bootstrap-icons";
import { toast } from "react-toastify";

const CustomersScreen = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data: { session } } = await supabase.auth.getSession();

            const response = await fetch('/api/customers', {
                headers: {
                    'Authorization': `Bearer ${session?.access_token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to load customers');
            }

            const data = await response.json();
            setUsers(data || []);
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
        {
            label: "Role",
            key: "role",
            render: (row) => (
                <span className={`${styles.roleBadge} ${styles[row.role || 'user']}`}>
                    {row.role || 'user'}
                </span>
            )
        },
        { label: "Joined", key: "created_at", render: (row) => new Date(row.created_at).toLocaleDateString() },
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
                    />
                </div>
            </div>
        </div>
    );
};

export default CustomersScreen;
