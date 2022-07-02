import { ingame } from "$lib/opgg";

export async function get({ url }) {
  const data: any = await ingame(
    url.searchParams.get("name"),
    url.searchParams.get("region")
  );

  if (data) {
    return {
      body: data.data,
    };
  }

  return {
    status: 404,
  };
}
