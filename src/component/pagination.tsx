import { Pagination } from "@mantine/core";
import { FC } from "react";
import styles from "../styles/table.module.scss";

const PaginationComponent: FC = () => {
  return <Pagination className={styles.pagination} total={10} />;
};

export default PaginationComponent;
