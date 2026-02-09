import React from "react";
import styles from "./DataTable.module.scss";

const DataTable = ({ columns, data, loading, onRowClick }) => {
    if (loading) {
        return (
            <div className={styles.tableWrapper}>
                <div className={styles.loading}>Loading data...</div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={styles.tableWrapper}>
                <div className={styles.empty}>No records found.</div>
            </div>
        );
    }

    return (
        <div className={styles.tableWrapper}>
            <table>
                <thead>
                    <tr>
                        {columns.map((col, index) => (
                            <th key={index} style={{ width: col.width }}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <tr key={rowIndex} onClick={() => onRowClick && onRowClick(row)}>
                            {columns.map((col, colIndex) => (
                                <td key={colIndex}>
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;
