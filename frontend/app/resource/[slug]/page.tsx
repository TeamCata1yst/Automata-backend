import { cookies } from "next/headers";
import Home from "./taskComponent";
import { redirect } from "next/navigation";

export default async function Dashboard(props: any) {
  const slug = decodeURI(props.params.slug);

  const token = cookies().get("accessToken")?.value;
  if (!token) {
    redirect("/resource/login");
  }
  const a = token.split(".")[1];
  const b = JSON.parse(atob(a));
  if (b.admin) {
    redirect("/admin");
  } else if (b.client) {
    redirect("/client");
  }
  return <Home accessToken={token} t_id={slug} />;
}
