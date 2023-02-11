import useSWR from "swr";
// import axios from "axios";

export const useFetcher = (url: string, token: string) => {
  //リクエストのクッキーを{token}オブジェクトにパース？する
  // const fetcher = () =>
  //   axios
  //     .get(url, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     })
  //     .then((res) => res.data);

  const fetcher = async () => {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    return data;
  };

  const { data, error, isLoading } = useSWR(url, fetcher);

  return {
    data,
    error,
    isLoading,
  };
};
