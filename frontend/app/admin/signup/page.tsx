import { cookies } from "next/headers";
import Home from "./signUpComponent";
import { redirect } from "next/navigation";

export default async function Login() {
  const token = cookies().get("accessToken")?.value;

  if (token) {
    const a = token.split(".")[1];
    const b = JSON.parse(atob(a));
    if (b.admin) {
      redirect("/admin");
    } else if (b.client) {
      redirect("/client");
    } else {
      redirect("/resource");
    }
  }
  return <Home />;
  // redirect('/admin/login');
}
