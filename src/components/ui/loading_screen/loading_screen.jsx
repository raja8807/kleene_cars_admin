import React from "react";
import styles from "./loading_screen.module.scss";
import { HeartFill } from "react-bootstrap-icons";

const LoadingScreen = (noBg) => {
  return (
    <div className={`${styles.LoadingScreen} ${noBg ? styles.noBg : ""}`}>
      <HeartFill />
    </div>
  );
};

export default LoadingScreen;
