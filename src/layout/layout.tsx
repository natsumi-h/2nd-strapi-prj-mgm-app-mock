import { FC, ReactNode, useContext } from "react";
// import { useDispatch, useSelector } from "react-redux";
import AuthContext from "../context/authContext";
import { Loader } from "@mantine/core";
import styles from "../styles/layout.module.scss";
import FooterLayout from "../component/footer";
import HeaderLayout from "../component/header";

type Props = {
  children: ReactNode;
  resolvedUrl: string;
};

const links = [
  {
    link: "/",
    label: "Home",
  },
  {
    link: "/create",
    label: "Create",
  },
  // {
  //   link: "https://google.com",
  //   label: "Logout",
  // },
];

const Layout: FC<Props> = ({ children, resolvedUrl }) => {
  // const dispatch = useDispatch();
  // // 分割代入
  // const { user } = useSelector((state) => state.auth);

  const { user } = useContext(AuthContext);
  if (resolvedUrl && resolvedUrl.match("/account/")) {
    return (
      <>
        <main>{children}</main>
      </>
    );
  } else if (!user) {
    return <Loader className={styles.center} />;
  } else {
    return (
      <>
        <HeaderLayout links={links}></HeaderLayout>
        <main>{children}</main>
        <FooterLayout />
      </>
    );
  }
};

export default Layout;
