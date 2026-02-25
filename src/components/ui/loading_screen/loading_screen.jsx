import React from "react";
import styles from "./loading_screen.module.scss";


const LoadingScreen = (noBg) => {
  return (
    <div className={`${styles.LoadingScreen} ${noBg ? styles.noBg : ""}`}>
      Loading...
    </div>
  );
};

export default LoadingScreen;
