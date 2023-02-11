import { useState } from "react";
import {
  createStyles,
  Header,
  Container,
  Group,
  Burger,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import styles from "../styles/Home.module.scss";
import Link from "next/link";
import { useRouter } from "next/router";
// import { logout } from "../state/authSlice";
// import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import AuthContext from "../context/authContext";

const useStyles = createStyles((theme) => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
  },

  links: {
    [theme.fn.smallerThan("xs")]: {
      display: "none",
    },
  },

  burger: {
    [theme.fn.largerThan("xs")]: {
      display: "none",
    },
  },

  link: {
    display: "block",
    lineHeight: 1,
    padding: "8px 12px",
    borderRadius: theme.radius.sm,
    textDecoration: "none",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  linkActive: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

interface HeaderSimpleProps {
  links: { link: string; label: string }[];
}

export function HeaderLayout({ links }: HeaderSimpleProps) {
  const router = useRouter();
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);
  const { classes, cx } = useStyles();
  // const dispatch = useDispatch();
  // // 分割代入
  // const { user } = useSelector((state) => state.auth);
  const { user, logout } = useContext(AuthContext);

  const items = links.map((link) => (
    <Link
      key={link.label}
      href={link.link}
      // className={cx(classes.link, {
      //   [classes.linkActive]: active === link.link,
      // })}
      className={classes.link}
    >
      {link.label}
    </Link>
  ));

  return (
    <Header height={60}>
      {/* <Container className={classes.header}> */}
      <div className={styles.container}>
        <div className={styles.headerContainer}>
          <Text className={styles.headerText}>
            Hello {user ? user.username : ""}!
          </Text>
          <Group spacing={5} className={classes.links}>
            {items}
            <button
              className={styles.logout}
              onClick={() => {
                // router.push("/account/login");
                // dispatch(logout());
                logout();
              }}
            >
              Logout
            </button>
          </Group>

          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
          />
        </div>
      </div>
      {/* </Container> */}
    </Header>
  );
}
