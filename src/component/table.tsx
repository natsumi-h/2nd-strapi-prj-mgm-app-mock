import { FC, useEffect, useState } from "react";
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
  Select,
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
import dayjs from "dayjs";
import { usePagination } from "@mantine/hooks";
import { Pagination } from "@mantine/core";
import { DateRangePicker, DateRangePickerValue } from "@mantine/dates";
import { useRouter } from "next/router";

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

type FilterType =
  | { event: DateRangePickerValue; filterData: boolean; type: string }
  | string
  | null
  | undefined;

function filterDataByDate(
  data: EditedProjectList[],
  event: DateRangePickerValue,
  type: string
) {
  // console.log(event);
  // console.log(data);
  // console.log(typeof event[0]);
  // const startCreatedOn = event && new Date(event[0] ? event[0] : "");
  // const startCreatedOn = event && new Date(event[0] ? event[0] : "");
  // const endCreatedOn = event && new Date(event[1] ? event[1] : "");
  const startOn = event && event[0];
  const endOn = event[1] && new Date(event[1].getTime() + 24 * 60 * 60 * 1000);
  const filteredProjectsByDate =
    data &&
    data
      .map((project: EditedProjectList) => {
        const date = new Date(
          type === "createdOn"
            ? project.createdOn
            : type === "updatedOn"
            ? project.updatedOn
            : ""
        );
        if (startOn && endOn && date >= startOn && date <= endOn) {
          return project;
        }
      })
      .filter((project) => project);

  return filteredProjectsByDate;
}

function sortData(
  data: EditedProjectList[],
  payload: {
    sortBy: keyof EditedProjectList | null;
    reversed: boolean;
    search: string;
    filter: FilterType;
  }
) {
  const { sortBy } = payload;

  // 1.フィルターのとき
  if (payload.filter) {
    // 1-1. ソートがないとき
    if (!sortBy) {
      // 1-1-1.日付フィルターで、空欄になるとき
      if (
        typeof payload.filter === "object" &&
        payload.filter.filterData &&
        // !payload.filter.event[0] &&
        !payload.filter.event[1]
      ) {
        return filterData(data, "");
      }
      // 1-1-2.日付フィルターで、値があるとき
      else if (
        typeof payload.filter === "object" &&
        payload.filter.filterData
      ) {
        return filterDataByDate(
          data,
          payload.filter.event,
          payload.filter.type
        );
      }
      // 1-1-3.日付以外のフィルターのとき
      else if (typeof payload.filter === "string") {
        return filterData(data, payload.filter);
      }
    }
    // 1-2 ソートがIDかsalesのとき
    else if (sortBy === "id" || sortBy === "sales") {
      // 1-2-1.日付フィルターで、空欄になるとき
      if (
        typeof payload.filter === "object" &&
        payload.filter.filterData &&
        !payload.filter.event[1]
      ) {
        return filterData(data, "");
      }
      // 1-2-2.日付フィルターのとき
      else if (
        typeof payload.filter === "object" &&
        payload.filter.filterData
      ) {
        return filterDataByDate(
          [...data].sort((a, b) => {
            if (payload.reversed) {
              return Number(b[sortBy]) - Number(a[sortBy]);
            } else {
              return Number(a[sortBy]) - Number(b[sortBy]);
            }
          }),
          payload.filter.event,
          payload.filter.type
        );
      }
      // 1-2-3.日付以外のフィルターのとき
      else if (typeof payload.filter === "string") {
        return filterData(
          [...data].sort((a, b) => {
            if (payload.reversed) {
              return Number(b[sortBy]) - Number(a[sortBy]);
            } else {
              return Number(a[sortBy]) - Number(b[sortBy]);
            }
          }),
          payload.filter
        );
      }
    }
    // 1-3. ソートがあるが、IDかSales以外のとき
    else {
      // 1-3-1 日付が空欄
      if (
        typeof payload.filter === "object" &&
        payload.filter.filterData &&
        !payload.filter.event[1]
      ) {
        return filterData(data, "");
      }
      // 1-3-2日付あり
      else if (
        typeof payload.filter === "object" &&
        payload.filter.filterData
      ) {
        return filterDataByDate(
          [...data].sort((a, b) => {
            if (payload.reversed) {
              return b[sortBy].localeCompare(a[sortBy]);
            } else {
              return a[sortBy].localeCompare(b[sortBy]);
            }
          }),
          payload.filter.event,
          payload.filter.type
        );
      }
      // 日付以外でのフィルター
      else if (typeof payload.filter === "string") {
        return filterData(
          [...data].sort((a, b) => {
            if (payload.reversed) {
              return b[sortBy].localeCompare(a[sortBy]);
            } else {
              return a[sortBy].localeCompare(b[sortBy]);
            }
          }),
          payload.filter
        );
      }
    }
  }

  // 1-3-1日付空欄
  // 1-3-2日付あり
  // 1-3-3日付以外

  // 2.検索のとき
  else {
    if (!sortBy) {
      return filterData(data, payload.search);
    } else if (sortBy === "id" || sortBy === "sales") {
      return filterData(
        [...data].sort((a, b) => {
          if (payload.reversed) {
            return Number(b[sortBy]) - Number(a[sortBy]);
          } else {
            return Number(a[sortBy]) - Number(b[sortBy]);
          }
        }),
        payload.search
      );
    } else {
      return filterData(
        [...data].sort((a, b) => {
          if (payload.reversed) {
            return b[sortBy].localeCompare(a[sortBy]);
          } else {
            return a[sortBy].localeCompare(b[sortBy]);
          }
        }),
        payload.search
      );
    }
  }
}

const TableSort: FC<TableSortProps> = ({ token }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType | string | null | undefined>(
    null
  );
  const [sortBy, setSortBy] = useState<keyof EditedProjectList | null>(null);
  const router = useRouter();
  const [updatedOnValue, setUpdatedOnValue] = useState<DateRangePickerValue>([
    null,
    null,
  ]);
  const [createdOnValue, setCreatedOnValue] = useState<DateRangePickerValue>([
    null,
    null,
  ]);

  // console.log(`filter:${filter}`);
  // console.log(`search:${search}`);
  const [reverseSortDirection, setReverseSortDirection] = useState(false);

  const endpointUrl = `${API_URL}/projects?populate=*&sort[0]=updatedAt:desc`;
  const { data, error, isLoading } = useFetcher(endpointUrl, token);
  const projectList = data ? data.data : "";
  // console.log(projectList && projectList);
  const editedProjectList =
    projectList &&
    projectList.map((editedProjectList: RowData) => ({
      id: editedProjectList.id.toString(),
      // id: editedProjectList.id,
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
      area: editedProjectList.attributes.related_area.data
        ? editedProjectList.attributes.related_area.data.attributes.areaName
        : "",
      branch: editedProjectList.attributes.related_branch.data
        ? editedProjectList.attributes.related_branch.data.attributes.branchName
        : "",
    }));

  const [sortedData, setSortedData] = useState(
    editedProjectList && editedProjectList
  );

  const setSorting = (field: keyof EditedProjectList) => {
    const reversed = field === sortBy ? !reverseSortDirection : false;
    setReverseSortDirection(reversed);
    setSortBy(field);
    setSortedData(
      sortData(editedProjectList, { sortBy: field, reversed, search, filter })
    );
    onChange(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
    setSortedData(
      sortData(editedProjectList, {
        sortBy,
        reversed: reverseSortDirection,
        search: value,
        filter: "",
      })
    );
    onChange(1);
    setFilter("");
    setCreatedOnValue([null, null]);
    setUpdatedOnValue([null, null]);
  };

  const handleFilterChange = (event: string) => {
    setFilter(event);
    // setSearch(event);
    // console.log(filter);
    setSortedData(
      sortData(editedProjectList, {
        sortBy,
        reversed: reverseSortDirection,
        // search: event,
        search: "",
        filter: event,
      })
    );

    onChange(1);
    setSearch("");
    setCreatedOnValue([null, null]);
    setUpdatedOnValue([null, null]);
  };

  const handleDateFilterChange = (
    event: DateRangePickerValue,
    type: string
  ) => {
    setSortedData(
      sortData(editedProjectList, {
        sortBy,
        reversed: reverseSortDirection,
        search: "",
        filter: { event, filterData: true, type },
      })
    );
    setSearch("");
    // setFilter(type);
    setFilter(event[0] && event[1] ? { event, filterData: true, type } : null);
    onChange(1);
    if (type == "createdOn") {
      setUpdatedOnValue([null, null]);
      setCreatedOnValue(event);
    } else if (type == "updatedOn") {
      setCreatedOnValue([null, null]);
      setUpdatedOnValue(event);
    }
  };

  const dataQuotient = sortedData && Math.floor(sortedData.length / 10);
  const dataRemainder = sortedData && sortedData.length / 10;
  const totalPage =
    dataRemainder && dataRemainder > 0 ? dataQuotient + 1 : dataQuotient;

  const [page, onChange] = useState(1);
  const pagination = usePagination({ total: totalPage, page, onChange });

  const slicedProjectList =
    sortedData && sortedData.slice((page - 1) * 10, (page - 1) * 10 + 10);

  const rowClickHandler = (id: string) => {
    router.push(`detail/${id}`);
  };

  const rows =
    // sortedData
    //   ? sortedData.map((row: EditedProjectList) => (
    //       <Link href={`detail/${row.id}`} className={styles.link} key={row.id}>
    //         {/* <tr key={row.id}> */}
    //         <td>{row.id}</td>
    //         <td>{row.createdOn}</td>
    //         <td>{row.updatedOn}</td>
    //         <td>{row.projectName}</td>
    //         <td>{row.pm}</td>
    //         <td>{row.status}</td>
    //         <td>{row.area}</td>
    //         <td>{row.branch}</td>
    //         <td>{row.sales}</td>
    //         {/* </tr> */}
    //       </Link>
    //     ))
    //   :
    slicedProjectList
      ? slicedProjectList.map((row: EditedProjectList) => (
          <tr
            key={row.id}
            className={styles.link}
            // onClick={RowClickHandler(row.id)}
            onClick={() => rowClickHandler(row.id)}
          >
            {/* <Link href={`detail/${row.id}`} className={styles.link}> */}
            <td>{row.id}</td>
            <td>{row.createdOn}</td>
            <td>{row.updatedOn}</td>
            <td>{row.projectName}</td>
            <td>{row.pm}</td>
            <td>{row.status}</td>
            <td>{row.area}</td>
            <td>{row.branch}</td>
            <td>{row.sales}</td>
            {/* </Link> */}
          </tr>
        ))
      : "";

  useEffect(() => {
    setSortedData(editedProjectList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const status = ["Lead", "Opportunity", "Dealed", "Closed", "Lost"];
  type PmValueLabel = {
    id: number;
    username: string;
  };
  const pmUrl = `${API_URL}/users`;
  const {
    data: pms,
    error: pmsError,
    isLoading: pmsLoading,
  } = useFetcher(pmUrl, token);

  const pmsValueLabel =
    pms &&
    pms.map((pmValueLabel: PmValueLabel) => ({
      value: pmValueLabel.username,
      label: pmValueLabel.username,
    }));
  type AreaValueLabel = {
    id: number;
    attributes: {
      areaName: string;
    };
  };
  const areaUrl = `${API_URL}/areas?populate=*`;
  const {
    data: areas,
    error: areasError,
    isLoading: areasLoading,
  } = useFetcher(areaUrl, token);
  const areasValueLabel =
    areas &&
    areas.data.map((areaValueLabel: AreaValueLabel) => ({
      // value: areaValueLabel.id,
      value: areaValueLabel.attributes.areaName,
      label: areaValueLabel.attributes.areaName,
    }));

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
  // console.log(createdOnValue);
  // console.log(editedProjectList);

  return (
    <div className={styles.wrapper}>
      <TextInput
        placeholder="Search by any field"
        mb="md"
        icon={<IconSearch size={14} stroke={1.5} />}
        value={search}
        onChange={handleSearchChange}
      />
      <div className={styles.filterWrapper}>
        <Select
          clearable
          label="Area"
          placeholder="Pick one"
          nothingFound="No options"
          data={areasValueLabel}
          value={typeof filter === "string" ? filter : null}
          onChange={handleFilterChange}
        />
        <Select
          clearable
          label="Status"
          placeholder="Pick one"
          nothingFound="No options"
          data={status}
          value={typeof filter === "string" ? filter : null}
          onChange={handleFilterChange}
        />
        <Select
          clearable
          label="PM"
          placeholder="Pick one"
          nothingFound="No options"
          data={pmsValueLabel}
          value={typeof filter === "string" ? filter : null}
          onChange={handleFilterChange}
        />
        <DateRangePicker
          clearable
          label="Created On"
          placeholder="Pick Created Data range"
          value={createdOnValue}
          // onChange={setCreatedOnValue}
          onChange={(event) => handleDateFilterChange(event, "createdOn")}
          // onChange={handleCreatedOnChange}
          inputFormat="YYYY-MM-DD"
          miw={250}
        />

        <DateRangePicker
          clearable
          label="Updated On"
          placeholder="Pick Updated Data range"
          value={updatedOnValue}
          // onChange={setUpdatedOnValue}
          onChange={(event) => handleDateFilterChange(event, "updatedOn")}
          inputFormat="YYYY-MM-DD"
          miw={250}
        />
      </div>
      <ScrollArea mt={40}>
        {/* <TextInput
          placeholder="Search by any field"
          mb="md"
          icon={<IconSearch size={14} stroke={1.5} />}
          value={search}
          onChange={handleSearchChange}
        /> */}
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
      <Pagination
        className={styles.pagination}
        total={totalPage}
        onChange={onChange}
        page={page}
      />
    </div>
  );
};

export default TableSort;
