import Head from "next/head";
import CustomersScreen from "@/components/screens/Customers/Customers";

const Customers = () => {
    return (
        <>
            <Head>
                <title>Customers | Kleene Cars Admin</title>
            </Head>
            <CustomersScreen />
        </>
    );
};

export default Customers;
