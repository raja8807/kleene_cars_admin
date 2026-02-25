import "../styles/globals.scss";
import { useEffect } from "react";
import Aos from "aos";
import "aos/dist/aos.css";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import Router from "next/router";
import Head from "next/head";

import { ToastContainer } from "react-toastify";
import Layout from "@/components/layout/layout";
import { FONTS } from "@/styles/fonts";
import { AuthProvider, useAuth } from "@/components/auth/AuthContext";

const MainApp = ({ children }) => {

  const { session } = useAuth();

  return (
    <main className={FONTS.font1}>
      <Layout>
        {
          children
        }
        <ToastContainer position="bottom-right" />
      </Layout>
    </main>
  )
}

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // ----------- AOS ----------------------
    Aos.init({
      duration: 1500,
      once: false,
    });

    // ----------- Progress ----------------------
    Router.events.on("routeChangeStart", (...params) => {
      NProgress.start(params);
    });
    Router.events.on("routeChangeComplete", NProgress.done);
    Router.events.on("routeChangeError", NProgress.done);
    return () => {
      Router.events.off("routeChangeStart", NProgress.start);
      Router.events.off("routeChangeComplete", NProgress.done);
      Router.events.off("routeChangeError", NProgress.done);
    };
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AuthProvider>
        <MainApp>
          <Component {...pageProps} />
        </MainApp>
      </AuthProvider>
    </>
  );
}
