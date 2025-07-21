import { cookies } from "next/headers";
import Query from "./queryComponent";
import { redirect } from "next/navigation";

export default async function Home(props: any) {
  const slug = decodeURI(props.params.slug);

  const token = cookies().get("accessToken")?.value;

  if (!token) {
    redirect("/client/login");
  }
  const a = token.split(".")[1];
  const b = JSON.parse(atob(a));
  if (b.admin) {
    redirect("/admin");
  } else if (b.resource) {
    redirect("/resource");
  }
  return <Query accessToken={token} q_id={slug} />;
}
