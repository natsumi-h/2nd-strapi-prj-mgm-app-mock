import { useState } from "react";
import styles from "../styles/table.module.scss";
import {
  createStyles,
  Table,
  ScrollArea,
  UnstyledButton,
  Group,
  Text,
  Center,
  TextInput,
  Loader,
} from "@mantine/core";
import { keys } from "@mantine/utils";
import {
  IconSelector,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react";
import { useFetcher } from "../hooks/useFetcher";
import { API_URL } from "../config";
// import { useSelector } from "react-redux";
import dayjs from "dayjs";
import Link from "next/link";

const useStyles = createStyles((theme) => ({
  th: {
    padding: "0 !important",
  },

  control: {
    width: "100%",
    padding: `${theme.spacing.xs}px ${theme.spacing.md}px`,

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[6]
          : theme.colors.gray[0],
    },
  },

  icon: {
    width: 21,
    height: 21,
    borderRadius: 21,
  },
}));

interface RowData {
  id: number;
  attributes: {
    createdAt: Date;
    projectName: string;
    updatedAt: Date;
    sales: number;
    status: string;
    pm: {
      data: {
        attributes: {
          username: string;
        };
      };
    };
    related_area: {
      data: {
        attributes: {
          areaName: string;
        };
      };
    };
    related_branch: {
      data: {
        attributes: {
          branchName: string;
        };
      };
    };
  };
}

interface EditedProjectList {
  id: string;
  projectName: string;
  status: string;
  sales: string;
  updatedOn: string;
  createdOn: string;
  area: string;
  branch: string;
  pm: string;
}

interface TableSortProps {
  // data: RowData[];
  token: string;
}
// type TableSortProps = RowData[];

interface ThProps {
  children: React.ReactNode;
  reversed: boolean;
  sorted: boolean;
  onSort(): void;
}

function Th({ children, reversed, sorted, onSort }: ThProps) {
  const { classes } = useStyles();
  const Icon = sorted
    ? reversed
      ? IconChevronUp
      : IconChevronDown
    : IconSelector;
  return (
    <th className={classes.th}>
      <UnstyledButton onClick={onSort} className={classes.control}>
        <Group position="apart">
          <Text weight={500} size="sm">
            {children}
          </Text>
          <Center className={classes.icon}>
            <Icon size={14} stroke={1.5} />
          </Center>
        </Group>
      </UnstyledButton>
    </th>
  );
}

function filterData(data: EditedProjectList[], search: string) {
  const query = search.toLowerCase().trim();
  return data.filter((item) =>
    keys(data[0]).some((key) => item[key].toLowerCase().includes(query))
  );
}

function sortData(
  data: EditedProjectList[],
  payload: {
    sortBy: keyof EditedProjectList | null;
    reversed: boolean;
    search: string;
  }
) {
  const { sortBy } = payload;

  if (!sortBy) {
    return filterData(data, payload.search);
  }

  return filterData(
    [...data].sort((a, b) => {
      if (payload.reversed) {
        return b[sortBy].localeCompare(a[sortBy]);
      }

      return a[sortBy].localeCompare(b[sortBy]);
    }),
    payload.search
  );
}

export function TableSort({ token }: TableSortProps) {
  const [search, setSearch] = useState("");

  const [sortBy, setSortBy] = useState<keyof EditedProjectList | null>(null);

  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const endpointUrl = `${API_URL}/projects?populate=*&sort[0]=updatedAt:desc&pagination[page]=1&pagination[pageSize]=10`;
  // const { token } = useSelector((state) => state.auth);
  // console.log(token);
  const { data, error, isLoading } = useFetcher(endpointUrl, token);
  // console.log(error);
  // console.log(data.error.message);

  const projectList = data ? data.data : "";
  // console.log(projectList && projectList);
  const editedProjectList =
    projectList &&
    projectList.map((editedProjectList: RowData) => ({
      id: editedProjectList.id.toString(),
      projectName: editedProjectList.attributes.projectName,
      sales: editedProjectList.attributes.sales.toString(),
      status: editedProjectList.attributes.status,
      // createdOn: editedProjectList.attributes.createdAt.toString(),
      createdOn: dayjs(editedProjectList.attributes.createdAt)
        .format("YYYY-MM-DD")
        .toString(),
      updatedOn: dayjs(editedProjectList.attributes.updatedAt)
        .format("YYYY-MM-DD")
        .toString(),
      pm: editedProjectList.attributes.pm.data.attributes.username,
      area: editedProjectList.attributes.related_area.data.attributes.areaName,
      branch:
        editedProjectList.attributes.related_branch.data.attributes.branchName,
    }));
  // console.log(editedProjectList);

  const [sortedData, setSortedData] = useState(
    editedProjectList && editedProjectList
  );

  const setSorting = (field: keyof EditedProjectList) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(
      sortData(editedProjectList, { sortBy: field, reversed, search })
    );
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(editedProjectList, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
      })
    );
  };

  const rows = sortedData
    ? sortedData.map((row: EditedProjectList) => (
        <Link href="https://google.com" className={styles.link} key={row.id}>
          {/* <tr key={row.id}> */}
          <td>{row.id}</td>
          <td>{row.createdOn}</td>
          <td>{row.updatedOn}</td>
          <td>{row.projectName}</td>
          <td>{row.pm}</td>
          <td>{row.status}</td>
          <td>{row.area}</td>
          <td>{row.branch}</td>
          <td>{row.sales}</td>
          {/* </tr> */}
        </Link>
      ))
    : editedProjectList
    ? editedProjectList.map((row: EditedProjectList) => (
        <tr key={row.id}>
          <td>{row.id}</td>
          <td>{row.createdOn}</td>
          <td>{row.updatedOn}</td>
          <td>{row.projectName}</td>
          <td>{row.pm}</td>
          <td>{row.status}</td>
          <td>{row.area}</td>
          <td>{row.branch}</td>
          <td>{row.sales}</td>
        </tr>
      ))
    : "";

  // console.log(editedProjectList || "edited project null");

  // console.log(sortedData || "sortedData null");

  if (error) {
    return (
      <Text weight={500} align="center">
        {error.message}
      </Text>
    );
  } else if (isLoading) {
    return <Loader className={styles.loader} />;
  } else if (data.error && data.error.message) {
    return (
      <Text weight={500} align="center">
        {data.error.message}
      </Text>
    );
  }
  // else if (rows && rows.length > 0) {
  return (
    <ScrollArea mt={40}>
      <TextInput
        placeholder="Search by any field"
        mb="md"
        icon={<IconSearch size={14} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <Table
        horizontalSpacing="md"
        verticalSpacing="xs"
        sx={{ tableLayout: "fixed", minWidth: 700 }}
      >
        <thead>
          <tr>
            <Th
              sorted={sortBy === "id"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("id")}
            >
              ID
            </Th>
            <Th
              sorted={sortBy === "createdOn"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("createdOn")}
            >
              Created On
            </Th>
            <Th
              sorted={sortBy === "updatedOn"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("updatedOn")}
            >
              Updated On
            </Th>
            <Th
              sorted={sortBy === "projectName"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("projectName")}
            >
              Project Name
            </Th>
            <Th
              sorted={sortBy === "pm"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("pm")}
            >
              PM
            </Th>
            <Th
              sorted={sortBy === "status"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("status")}
            >
              Status
            </Th>
            <Th
              sorted={sortBy === "area"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("area")}
            >
              Area
            </Th>
            <Th
              sorted={sortBy === "branch"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("branch")}
            >
              Branch
            </Th>
            <Th
              sorted={sortBy === "sales"}
              reversed={reverseSortDirection}
              onSort={() => setSorting("sales")}
            >
              Sales
            </Th>
          </tr>
        </thead>
        <tbody>
          {/* {projectList && rows} */}
          {editedProjectList && rows.length > 0 ? (
            rows
          ) : (
            <tr>
              <td
                // colSpan={Object.keys(editedProjectList[0]).length}
                colSpan={9}
              >
                <Text weight={500} align="center">
                  Nothing found
                </Text>
              </td>
            </tr>
          )}
          {/* {editedProjectList &&
            editedProjectList.map((project) => {
              <Text weight={500} align="center">
                Nothing found
              </Text>;
            })
            } */}
        </tbody>
      </Table>
    </ScrollArea>
  );
  // }
}
