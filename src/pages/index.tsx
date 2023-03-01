import Head from "next/head";
import styles from "../styles/Home.module.scss";
import cookie from "cookie";
import { NextApiRequest, NextPage } from "next";
import TableSort from "../component/table";

type Props = {
  token: string;
  // data: {};
};

const Home: NextPage<Props> = ({ token }) => {


  return (
    <div className={styles.container}>
      <Head>
        <title>Home title</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <TableSort token={token} />
      {/* <Pagination className={styles.pagination} total={10} /> */}
    </div>
  );
};

export const getServerSideProps = async ({ req }: { req: NextApiRequest }) => {
  const parseCookies = (req: NextApiRequest) => {
    return cookie.parse(req ? req.headers.cookie || "" : "");
  };
  const { token } = parseCookies(req);
  // const res = await fetch(
  //   `${API_URL}/projects?populate=*&sort[0]=updatedAt:desc&pagination[page]=1&pagination[pageSize]=10`,
  //   {
  //     method: "GET",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: `Bearer ${token}`,
  //     },
  //   }
  // );
  // const data = await res.json();

  return token
    ? {
        props: {
          token,
        },
      }
    : {
        props: {},
      };
};

export default Home;
