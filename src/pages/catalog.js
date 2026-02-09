import Head from "next/head";
import CatalogScreen from "@/components/screens/Catalog/Catalog";

const Catalog = () => {
    return (
        <>
            <Head>
                <title>Catalog | Kleene Cars Admin</title>
            </Head>
            <CatalogScreen />
        </>
    );
};

export default Catalog;
