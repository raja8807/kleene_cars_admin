import Head from "next/head";
import AdminsScreen from "@/components/screens/Admins/Admins";

const Admins = () => {
    return (
        <>
            <Head>
                <title>Admins | Kleene Cars Admin</title>
            </Head>
            <AdminsScreen />
        </>
    );
};

export default Admins;
