import { createStyles, Container, Group, Anchor } from "@mantine/core";
import { FC } from "react";
// import { MantineLogo } from "@mantine/ds";
import styles from "../styles/footer.module.scss";

const useStyles = createStyles((theme) => ({
  footer: {
    marginTop: 120,
    borderTop: `1px solid ${
      theme.colorScheme === "dark" ? theme.colors.dark[5] : theme.colors.gray[2]
    }`,
  },

  inner: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,

    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column",
    },
  },

  links: {
    [theme.fn.smallerThan("xs")]: {
      marginTop: theme.spacing.md,
    },
  },
}));

interface FooterSimpleProps {
  // links: { link: string; label: string }[];
}

const FooterLayout: FC<FooterSimpleProps> = ({}) => {
  const { classes } = useStyles();

  // const items = navLinks.map((link) => (
  //   <Anchor<"a">
  //     color="dimmed"
  //     key={link.label}
  //     href={link.link}
  //     onClick={(event) => event.preventDefault()}
  //     size="sm"
  //   >
  //     {link.label}
  //   </Anchor>
  // ));

  return (
    <div
      // className={classes.footer}
      className={styles.footer}
    >
      <div className={styles.footerContainer}>Project Management App</div>
    </div>
  );
};

export default FooterLayout;
