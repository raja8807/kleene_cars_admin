import React, { useState } from "react";
import styles from "./Catalog.module.scss";
import Categories from "./Categories/Categories";
import Services from "./Services/Services";
import Products from "./Products/Products";
import Banners from "./Banners/Banners";

const CatalogScreen = () => {
    const [activeTab, setActiveTab] = useState("Categories");

    const tabs = ["Categories", "Services", "Products", "Banners"];

    return (
        <div className={styles.catalogWrapper}>
            <div className={styles.subHeader}>
                <div className={styles.tabs}>
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={activeTab === tab ? styles.active : ""}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            <div className={styles.content}>
                {activeTab === "Categories" && <Categories />}
                {activeTab === "Services" && <Services />}
                {activeTab === "Products" && <Products />}
                {activeTab === "Banners" && <Banners />}
            </div>
        </div>
    );
};


export default CatalogScreen;
