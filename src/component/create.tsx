import { FC } from "react";
import {
  createStyles,
  Select,
  TextInput,
  NumberInput,
  Button,
} from "@mantine/core";
import styles from "../styles/create.module.scss";
import { useRouter } from "next/router";
import { useForm } from "@mantine/form";
import { useFetcher } from "../hooks/useFetcher";
import { API_URL } from "../config";
import { Loader } from "@mantine/core";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";

type Props = {
  token: string;
};

const useStyles = createStyles((theme) => ({
  root: {
    position: "relative",
  },

  input: {
    height: "auto",
    paddingTop: 18,
  },

  label: {
    position: "absolute",
    pointerEvents: "none",
    fontSize: theme.fontSizes.xs,
    paddingLeft: theme.spacing.sm,
    paddingTop: theme.spacing.sm / 2,
    zIndex: 1,
  },
}));

type PmValueLabel = {
  id: number;
  username: string;
};

type AreaValueLabel = {
  id: number;
  attributes: {
    areaName: string;
  };
};

type BranchValueLabel = {
  id: number;
  attributes: {
    branchName: string;
  };
};

const CreateComponent: FC<Props> = ({ token }) => {
  const { classes } = useStyles();
  const router = useRouter();
  const goHome = () => {
    router.push("/");
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
      value: pmValueLabel.id,
      label: pmValueLabel.username,
    }));

  const areaUrl = `${API_URL}/areas?populate=*`;
  const {
    data: areas,
    error: areasError,
    isLoading: areasLoading,
  } = useFetcher(areaUrl, token);
  const areasValueLabel =
    areas &&
    areas.data.map((areaValueLabel: AreaValueLabel) => ({
      value: areaValueLabel.id,
      label: areaValueLabel.attributes.areaName,
    }));

  const status = ["Lead", "Opportunity", "Dealed", "Closed", "Lost"];

  const form = useForm({
    initialValues: {
      projectName: "",
      pm: "",
      status: "",
      related_area: "",
      related_branch: "",
      sales: 0,
    },

    validate: {
      projectName: (val) => {
        if (val.length === 0) {
          return "Please input Project Name";
        } else if (val.length >= 50) {
          return "Project Name must be within 50 characters";
        } else {
          return null;
        }
      },
      pm: (val) => {
        if (!val) {
          return "Please select PM";
        } else {
          return null;
        }
      },
      status: (val) => {
        if (!val) {
          return "Please select Status";
        } else {
          return null;
        }
      },
      sales: (val) => {
        if (val == null) {
          return "Please input Sales";
        } else {
          return null;
        }
      },
    },
  });

  type Area = {
    id: string;
  };

  const branchesValueLabel = () => {
    if (form.values.related_area) {
      const areasData = areas.data;
      // areasDataの中からvalueのIDと等しいオブジェクトだけを取り出す
      const filteredArea = areas.data.filter((area: Area) => {
        return area.id == form.values.related_area;
      });
      // その中の0番目の、branchesのデータを取り出す
      const filteredAreaBranches =
        filteredArea[0] && filteredArea[0].attributes.branches.data;
      const branchesValueLabel = filteredAreaBranches.map(
        (branchValueLabel: BranchValueLabel) => ({
          value: branchValueLabel.id,
          label: branchValueLabel.attributes.branchName,
        })
      );
      return branchesValueLabel;
    }
  };

  type Values = {
    projectName: string;
    pm: number;
    status: string;
    related_area?: number;
    related_branch?: number;
    sales: number;
  };

  const createModal = (values: Values) =>
    openConfirmModal({
      title: "Create Project?",
      labels: { confirm: "Create", cancel: "Cancel" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => handleSubmit(values),
      groupProps: { position: "center" },
    });

  const handleSubmit = async (values: Values) => {
    const res = await fetch(`${API_URL}/projects`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: values }),
      //   body: JSON.stringify({ data: sendingValues() }),
    });
    if (!res.ok) {
      if (res.status === 403 || res.status === 401) {
        console.log("No token included");
        return;
      } else {
        console.log("something went wrong");
      }
    } else {
      router.push("/");
      showNotification({
        autoClose: 5000,
        title: "Yay!",
        message: "Project has been created!",
      });
    }
  };

  return pmsLoading && areasLoading ? (
    <Loader className={styles.loader}></Loader>
  ) : pms && areas ? (
    <form
      className={styles.inputWrapper}
      onSubmit={form.onSubmit((values) => {
        type ConvertedValues = {
          projectName: string;
          pm: number;
          status: string;
          related_area?: number;
          related_branch?: number;
          sales: number;
        };

        const convertedValues: ConvertedValues = {
          ...values,
          pm: +values.pm,
          related_area: +values.related_area,
          related_branch: +values.related_branch,
        };
        !values.related_area && delete convertedValues.related_area;
        !values.related_branch && delete convertedValues.related_branch;
        createModal(convertedValues);
      })}
    >
      <TextInput
        withAsterisk
        label="Project Name"
        placeholder="ABC Project"
        classNames={classes}
        {...form.getInputProps("projectName")}
      />
      <Select
        withAsterisk
        clearable
        data={pmsValueLabel}
        placeholder="Pick one"
        label="PM"
        classNames={classes}
        {...form.getInputProps("pm")}
      />
      <Select
        // style={{ marginTop: 20, zIndex: 2 }}
        withAsterisk
        clearable
        data={status}
        placeholder="Pick one"
        label="Status"
        classNames={classes}
        {...form.getInputProps("status")}
      />

      <Select
        // style={{ marginTop: 20, zIndex: 2 }}
        clearable
        data={areasValueLabel}
        placeholder="Pick one"
        label="Area"
        classNames={classes}
        {...form.getInputProps("related_area")}
      />

      <Select
        // style={{ marginTop: 20, zIndex: 2 }}
        clearable
        disabled={!form.values.related_area ? true : false}
        data={form.values.related_area ? branchesValueLabel() : []}
        placeholder={!form.values.related_area ? "Pick Area" : "Pick one"}
        label="Branch"
        classNames={classes}
        {...form.getInputProps("related_branch")}
      />

      <NumberInput
        withAsterisk
        label="Sales($)"
        placeholder="15329"
        classNames={classes}
        {...form.getInputProps("sales")}
      />
      <div className={styles.buttonWrapper}>
        <Button size="md" miw={200} onClick={goHome}>
          Go back
        </Button>
        <Button size="md" miw={200} type="submit">
          Create
        </Button>
      </div>
    </form>
  ) : (
    <>Something went wrong. Please try again</>
  );
};

export default CreateComponent;
