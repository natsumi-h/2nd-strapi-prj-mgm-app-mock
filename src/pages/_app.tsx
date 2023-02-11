import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider } from "@mantine/core";
import Layout from "../layout/layout";
import "../styles/globals.scss";
// import { AuthProvider } from "../context/authContext-old.org";
import { AuthProvider } from "../context/authContext";
// import { Provider } from "react-redux";
// import { store } from "../state";
import { NotificationsProvider } from "@mantine/notifications";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Gloval Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "light",
        }}
      >
        <NotificationsProvider>
          {/* <Provider store={store}> */}
          <AuthProvider>
            <Layout {...pageProps}>
              <Component {...pageProps} />
            </Layout>
          </AuthProvider>
          {/* </Provider> */}
        </NotificationsProvider>
      </MantineProvider>
    </>
  );
}
