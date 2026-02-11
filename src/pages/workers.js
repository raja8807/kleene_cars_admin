import Head from "next/head";
import WorkersScreen from "@/components/screens/Workers/Workers";

const Workers = () => {
    return (
        <>
            <Head>
                <title>Workers | Kleene Cars Admin</title>
            </Head>
            <WorkersScreen />
        </>
    );
};

export default Workers;
