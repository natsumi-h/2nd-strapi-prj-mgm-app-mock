import { FC } from "react";
import { API_URL } from "../config";
import { useFetcher } from "../hooks/useFetcher";
import styles from "../styles/detail.module.scss";
import { Loader } from "@mantine/core";
import { Button } from "@mantine/core";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { openConfirmModal } from "@mantine/modals";
import { showNotification } from "@mantine/notifications";

type Props = {
  token: string;
  id: number;
};

const DetailComponent: FC<Props> = ({ token, id }) => {
  const projectUrl = `${API_URL}/projects/${id}?populate=*`;
  const {
    data: projectData,
    error: projectError,
    isLoading: projectLoading,
  } = useFetcher(projectUrl, token);

  const router = useRouter();
  const goHome = () => {
    router.push("/");
  };

  const goEdit = () => {
    router.push(`/edit/${id}`);
  };
  const deleteModal = () =>
    openConfirmModal({
      title: "Delete Project?",
      labels: { confirm: "Delete", cancel: "Cancel" },
      onCancel: () => console.log("Cancel"),
      onConfirm: () => handleDelete(),
      groupProps: { position: "center" },
    });

  const handleDelete = async () => {
    const res = await fetch(`${API_URL}/projects/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
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
        message: "Project has been deleted!",
      });
    }
  };

  return projectLoading ? (
    <Loader className={styles.loader}></Loader>
  ) : projectData ? (
    <div className={styles.detailWrapper}>
      <dl className={styles.dl}>
        <div className="flex flex-col pb-3">
          <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
            Project ID
          </dt>
          <dd className="text-lg font-semibold">{projectData.data.id}</dd>
        </div>
        <div className="flex flex-col py-3">
          <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
            Project Name
          </dt>
          <dd className="text-lg font-semibold">
            {projectData.data.attributes.projectName}
          </dd>
        </div>
        <div className="flex flex-col py-3">
          <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
            Created On
          </dt>
          <dd className="text-lg font-semibold">
            {dayjs(projectData.data.attributes.createdAt).format("YYYY-MM-DD")}
          </dd>
        </div>
        <div className="flex flex-col py-3">
          <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
            Updated On
          </dt>
          <dd className="text-lg font-semibold">
            {dayjs(projectData.data.attributes.updatedAt).format("YYYY-MM-DD")}
          </dd>
        </div>
        <div className="flex flex-col py-3">
          <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
            PM
          </dt>
          <dd className="text-lg font-semibold">
            {projectData.data.attributes.pm.data.attributes.username}
          </dd>
        </div>
        <div className="flex flex-col py-3">
          <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
            Status
          </dt>
          <dd className="text-lg font-semibold">
            {projectData.data.attributes.status}
          </dd>
        </div>
        <div className="flex flex-col py-3">
          <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
            Area
          </dt>
          <dd className="text-lg font-semibold h-7">
            {projectData.data.attributes.related_area.data
              ? projectData.data.attributes.related_area.data.attributes
                  .areaName
              : ""}
          </dd>
        </div>
        <div className="flex flex-col py-3">
          <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
            Branch
          </dt>
          <dd className="text-lg font-semibold h-7">
            {projectData.data.attributes.related_branch.data
              ? projectData.data.attributes.related_branch.data.attributes
                  .branchName
              : ""}
          </dd>
        </div>
        <div className="flex flex-col py-3">
          <dt className="mb-1 text-gray-500 md:text-lg dark:text-gray-400">
            Sales($)
          </dt>
          <dd className="text-lg font-semibold">
            {projectData.data.attributes.sales}
          </dd>
        </div>
      </dl>
      <div className={styles.buttonWrapper}>
        <Button size="md" miw={200} onClick={goHome}>
          Go back
        </Button>
        <Button size="md" miw={200} onClick={goEdit}>
          Edit
        </Button>
        <Button size="md" miw={200} onClick={deleteModal}>
          Delete
        </Button>
      </div>
    </div>
  ) : (
    projectError && <p>Something went wrong. Please try again</p>
  );
};

export default DetailComponent;
