import React from "react";
import styles from "./custom_button.module.scss";
import Link from "next/link";

const CustomButton = ({
  children,
  disabled,
  type = "button",
  variant = "primary",
  fullWidth = false,
  onClick,
  className = "",
  href = "",
}) => {
  if (href) {
    return (
      <Link href={href}>
        <button
          type={type}
          disabled={disabled}
          onClick={onClick}
          className={`${styles.CustomButton} ${styles[variant]} ${fullWidth ? styles.fullWidth : ""} ${className}`}
        >
          {children}
        </button>
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${styles.CustomButton} ${styles[variant]} ${fullWidth ? styles.fullWidth : ""} ${className}`}
    >
      {children}
    </button>
  );
};

export default CustomButton;
