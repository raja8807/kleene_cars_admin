import styles from "./DataTable.module.scss";
import { ChevronLeft, ChevronRight } from "react-bootstrap-icons";

const DataTable = ({ columns, data, loading, onRowClick, currentPage, totalPages, onPageChange }) => {
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

            {totalPages > 1 && (
                <div className={styles.pagination}>
                    <button
                        className={styles.pageBtn}
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={14} /> Previous
                    </button>

                    <div className={styles.pageInfo}>
                        Page <span>{currentPage}</span> of <span>{totalPages}</span>
                    </div>

                    <button
                        className={styles.pageBtn}
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default DataTable;
