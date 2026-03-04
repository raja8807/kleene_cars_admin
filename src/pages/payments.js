import Head from "next/head";
import PaymentsScreen from "@/components/screens/Payments/Payments";

const Payments = () => {
    return (
        <>
            <Head>
                <title>Payments | Kleene Cars Admin</title>
            </Head>
            <PaymentsScreen />
        </>
    );
};

export default Payments;
