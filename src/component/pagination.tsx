import { Pagination } from "@mantine/core";
import styles from "../styles/table.module.scss";

function Demo() {
  return <Pagination className={styles.pagination} total={10} />;
}
