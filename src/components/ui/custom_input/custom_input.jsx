import React from "react";
import styles from "./custom_input.module.scss";

const CustomInput = ({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder,
    error,
    disabled = false,
    className = "",
    id,
    required = false,
    ...props
}) => {
    const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className={`${styles.container} ${className}`}>
            {label && (
                <label htmlFor={inputId} className={styles.label}>
                    {label} {required && <span className={styles.required}>*</span>}
                </label>
            )}

            <div className={styles.inputWrapper}>
                <input
                    id={inputId}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`${styles.input} ${error ? styles.hasError : ""}`}
                    required={required}
                    {...props}
                />
            </div>

            {error && <span className={styles.error}>{error}</span>}
        </div>
    );
};

export default CustomInput;
