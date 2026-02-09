import Head from "next/head";
import OrdersScreen from "@/components/screens/Orders/Orders";

const Orders = () => {
    return (
        <>
            <Head>
                <title>Orders | Kleene Cars Admin</title>
            </Head>
            <OrdersScreen />
        </>
    );
};

export default Orders;
