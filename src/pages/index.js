import HomeScreen from "@/components/screens/home/home";
import { useEffect } from "react";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/orders");
  }, []);

  return <></>;
};

export default Home;
