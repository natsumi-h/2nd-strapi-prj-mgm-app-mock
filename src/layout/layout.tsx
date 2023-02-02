import { FC, ReactNode } from "react";
import { FooterLayout } from "../component/footer";
import { HeaderLayout } from "../component/header";

type Props = {
  children: ReactNode;
  resolvedUrl: string;
};

const Layout: FC<Props> = ({ children, resolvedUrl }) => {
  if (resolvedUrl && resolvedUrl.match("/account/")) {
    return (
      <>
        <main>{children}</main>
      </>
    );
  } else {
    return (
      <>
        <HeaderLayout></HeaderLayout>
        <main>{children}</main>
        <FooterLayout></FooterLayout>
      </>
    );
  }
};

export default Layout;
