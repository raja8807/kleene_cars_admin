import React, { useState, useEffect } from "react";
import styles from "./Admins.module.scss"; // Will create this from Workers.module.scss
import DataTable from "@/components/ui/DataTable/DataTable";
import AdminModal from "./AdminModal/AdminModal";
import {
    Search, Plus, Pencil, Trash,
    ShieldLockFill, PersonCheck, PersonDash
} from "react-bootstrap-icons";
import { toast } from "react-toastify";
import adminService from "@/services/adminService";
import { useAuth } from "@/components/auth/AuthContext";
import { useRefresh } from "@/context/RefreshContext";

const AdminsScreen = () => {
    const { refreshKey } = useRefresh();
    const { isAdmin } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);

    useEffect(() => {
        fetchAdmins();
    }, [refreshKey]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllSubAdmins();
            setAdmins(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load sub-admins");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingAdmin(null);
        setIsModalOpen(true);
    };

    const handleEdit = (admin) => {
        setEditingAdmin(admin);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this sub-admin?")) {
            try {
                await adminService.deleteSubAdmin(id);
                setAdmins(prev => prev.filter(a => a.id !== id));
                toast.success("Sub-admin deleted successfully");
            } catch (error) {
                toast.error("Failed to delete sub-admin");
            }
        }
    };

    const handleToggleStatus = async (id) => {
        const admin = admins.find(a => a.id === id);
        if (!admin) return;

        const newStatus = admin.status === "Active" ? "Inactive" : "Active";

        try {
            // Optimistic update
            setAdmins(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));

            await adminService.updateSubAdmin(id, { status: newStatus });
            toast.success(`Admin status updated to ${newStatus}`);
        } catch (error) {
            console.error("Failed to update admin status", error);
            // Rollback on error
            setAdmins(prev => prev.map(a => a.id === id ? { ...a, status: admin.status } : a));
            toast.error("Failed to update status");
        }
    };

    const handleSaveAdmin = (adminData) => {
        fetchAdmins();
        setIsModalOpen(false);
    };

    const getFilteredAdmins = () => {
        let result = admins;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                (a.full_name && a.full_name.toLowerCase().includes(q)) ||
                (a.phone && a.phone.includes(q)) ||
                (a.email && a.email.toLowerCase().includes(q))
            );
        }

        return result;
    };

    const columns = [
        { label: "Admin ID", key: "id", render: (row) => <strong>#{row.id.slice(0, 8)}</strong> },
        {
            label: "Name", key: "full_name", render: (row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{row.full_name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{row.email}</div>
                </div>
            )
        },
        { label: "Phone", key: "phone" },
        {
            label: "Status", key: "status", render: (row) => (
                <label className={styles.toggleSwitch}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <input
                        type="checkbox"
                        checked={row.status === "Active"}
                        onChange={() => handleToggleStatus(row.id)}
                    />
                    <span className={styles.slider}></span>
                </label>
            )
        },
        {
            label: "Role", key: "role", render: (row) => (
                <span style={{
                    textTransform: 'capitalize',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#eef2ff',
                    color: '#4f46e5',
                    fontSize: '12px',
                    fontWeight: '600'
                }}>
                    {row.role}
                </span>
            )
        },
        {
            label: "Actions", key: "actions", render: (row) => (
                <div className={styles.actions}>
                    <button className={styles.edit} onClick={(e) => { e.stopPropagation(); handleEdit(row); }} title="Edit">
                        <Pencil />
                    </button>
                    <button className={styles.delete} onClick={(e) => { e.stopPropagation(); handleDelete(row.id); }} title="Delete">
                        <Trash />
                    </button>
                </div>
            )
        }
    ];

    if (!isAdmin) {
        return (
            <div style={{ padding: 40, textAlign: 'center' }}>
                <h1>Access Denied</h1>
                <p>You do not have permission to manage admins.</p>
            </div>
        );
    }

    return (
        <div className={styles.adminsWrapper}>


            <div className={styles.contentContainer}>
                <div className={styles.toolbar}>
                    <div className={styles.leftActions}>
                        <div className={styles.search}>
                            <Search />
                            <input
                                placeholder="Search by name, phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <button className={styles.addBtn} onClick={handleAdd}>
                        <Plus size={20} /> Add Admin
                    </button>
                </div>

                <div className={styles.tableContainer}>
                    <DataTable
                        columns={columns}
                        data={getFilteredAdmins()}
                        loading={loading}
                        onRowClick={(row) => handleEdit(row)}
                    />
                </div>
            </div>

            {isModalOpen && (
                <AdminModal
                    admin={editingAdmin}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveAdmin}
                />
            )}
        </div>
    );
};

export default AdminsScreen;
