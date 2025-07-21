import { cookies } from "next/headers";
import Home from "./projectEditComponent";
import { redirect } from "next/navigation";

export default async function Edit(props: any) {
  const slug = decodeURI(props.params.slug);

  const token = cookies().get("accessToken")?.value;

  if (!token) {
    redirect("/admin/login");
  }
  const a = token.split(".")[1];
  const b = JSON.parse(atob(a));
  if (b.client) {
    redirect("/client");
  } else if (b.resource) {
    redirect("/resource");
  }
  return <Home accessToken={token} p_id={slug} />;
}
