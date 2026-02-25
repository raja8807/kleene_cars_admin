import React, { useState, useEffect } from "react";
import styles from "./Workers.module.scss";
import DataTable from "@/components/ui/DataTable/DataTable";
import WorkerModal from "./WorkerModal/WorkerModal";
import dynamic from 'next/dynamic';
import {
    Search, Plus, Pencil, Trash,
    PersonVideo3, PersonCheck, PersonDash, GeoAlt
} from "react-bootstrap-icons";
import { toast } from "react-toastify";
import workerService from "@/services/workerService";

const WorkerMapModal = dynamic(() => import("./WorkerMapModal/WorkerMapModal"), {
    ssr: false,
});

const WorkersScreen = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWorker, setEditingWorker] = useState(null);
    const [trackingWorker, setTrackingWorker] = useState(null);

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const data = await workerService.getAllWorkers();
            setWorkers(data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load workers");
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const stats = {
        total: workers.length,
        active: workers.filter(w => w.status === "Active").length,
        inactive: workers.filter(w => w.status === "Inactive").length
    };

    // Handlers
    const handleAdd = () => {
        setEditingWorker(null);
        setIsModalOpen(true);
    };

    const handleEdit = (worker) => {
        setEditingWorker(worker);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this worker?")) {
            // Ideally call API to delete
            // For now just local until delete API is ready
            setWorkers(prev => prev.filter(w => w.id !== id));
            toast.success("Worker deleted successfully");
        }
    };

    const handleToggleStatus = (id) => {
        // Prepare for API call
        setWorkers(prev => prev.map(w => {
            if (w.id === id) {
                const newStatus = w.status === "Active" ? "Inactive" : "Active";
                // toast.info(`Worker marked as ${newStatus}`); 
                // In real app, call API here to update status
                return { ...w, status: newStatus };
            }
            return w;
        }));
    };

    const handleSaveWorker = (workerData) => {
        if (editingWorker) {
            // Update local state for now, assuming edit API is not yet main focus or handled in modal
            setWorkers(prev => prev.map(w => w.id === editingWorker.id ? { ...w, ...workerData } : w));
            toast.success("Worker updated successfully");
        } else {
            // Created via API in modal, just refresh list
            fetchWorkers();
        }
        setIsModalOpen(false);
    };

    // Filtering
    const getFilteredWorkers = () => {
        let result = workers;

        if (filter !== "All") {
            result = result.filter(w => w.status === filter);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(w =>
                w.name.toLowerCase().includes(q) ||
                w.phone.includes(q) ||
                w.email.toLowerCase().includes(q)
            );
        }

        return result;
    };

    const columns = [
        { label: "Worker ID", key: "id", render: (row) => <strong>#{row.id}</strong> },
        {
            label: "Name", key: "name", render: (row) => (
                <div>
                    <div style={{ fontWeight: 600 }}>{row.name}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{row.email}</div>
                </div>
            )
        },
        { label: "Phone", key: "phone" },
        { label: "Experience", key: "experience" },
        { label: "Rating", key: "rating", render: (row) => <span>⭐ {row.rating}</span> },
        { label: "Orders", key: "assignedOrders", render: (row) => <span style={{ fontWeight: 600 }}>{row.assignedOrders}</span> },
        {
            label: "Status", key: "status", render: (row) => (
                <label className={styles.toggleSwitch}>
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
            label: "Actions", key: "actions", render: (row) => (
                <div className={styles.actions}>
                    <button
                        className={styles.edit}
                        onClick={(e) => {
                            e.stopPropagation();
                            setTrackingWorker(row);
                        }}
                        title="Track Location"
                        style={{ marginRight: 8, backgroundColor: '#eef2ff', color: '#4f46e5' }}
                    >
                        <GeoAlt />
                    </button>
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

    return (
        <div className={styles.workersWrapper}>
            {/* Stats */}
            <div className={styles.statsRow}>
                <div className={`${styles.statCard} ${styles.blue}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Total Workers</span>
                        <span className={styles.value}>{stats.total}</span>
                    </div>
                    <div className={styles.icon}><PersonVideo3 /></div>
                </div>
                <div className={`${styles.statCard} ${styles.green}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Active</span>
                        <span className={styles.value}>{stats.active}</span>
                    </div>
                    <div className={styles.icon}><PersonCheck /></div>
                </div>
                <div className={`${styles.statCard} ${styles.red}`}>
                    <div className={styles.info}>
                        <span className={styles.label}>Inactive</span>
                        <span className={styles.value}>{stats.inactive}</span>
                    </div>
                    <div className={styles.icon}><PersonDash /></div>
                </div>
            </div>

            {/* Content */}
            <div className={styles.contentContainer}>
                {/* Toolbar */}
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
                        <div className={styles.filter}>
                            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                <option value="All">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                    </div>
                    <button className={styles.addBtn} onClick={handleAdd}>
                        <Plus size={20} /> Add Worker
                    </button>
                </div>

                {/* Table */}
                <div className={styles.tableContainer}>
                    <DataTable
                        columns={columns}
                        data={getFilteredWorkers()}
                        loading={loading}
                    />
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <WorkerModal
                    worker={editingWorker}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveWorker}
                />
            )}

            {trackingWorker && (
                <WorkerMapModal
                    worker={trackingWorker}
                    onClose={() => setTrackingWorker(null)}
                />
            )}
        </div>
    );
};

export default WorkersScreen;
