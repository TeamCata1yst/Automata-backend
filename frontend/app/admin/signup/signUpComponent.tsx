"use client";
import Navbar from "@/components/Navbar";
import Video from "@/components/Video";
import Footer from "@/components/Footer";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_APILINK;

export default function Home() {
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const pass = e.target.password.value;
    const confirm_pass = e.target.confirm_password.value;
    if (pass !== confirm_pass) {
      alert("Passwords do not match");
      return;
    }
    const res = await fetch(`${api}/admin/auth/signup`, {
      body: JSON.stringify({
        name: name,
        email: email,
        password: pass,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = await res.json();
    if (data.error) {
      alert(data.error);
    } else {
      location.replace("/admin/login");
    }
  };

  return (
    <>
      <Navbar instance="login" />

      <div className="flex -m-32 -mt-48">
        <div className="w-full min-h-screen flex items-center justify-center bg-[#010101]">
          <div className="flex flex-col gap-6 z-10 items-center py-16 px-24 rounded-lg border-2 border-white/10 relative">
            <div className="bg-[url(/bg-1.png)] -z-10 bg-cover bg-center absolute top-0 left-0 bottom-0 right-0 opacity-30"></div>
            <h1 className="font-primary text-white font-bold text-4xl">
              Admin Sign Up
            </h1>
            <hr className="w-20 border-3 border-auto-red" />
            <form
              className="flex flex-col gap-6 items-center"
              onSubmit={handleSubmit}
            >
              <input
                type="text"
                name="name"
                placeholder="Username"
                className="w-96 p-2 px-4 bg-transparent outline-none border-b-2 border-transparent border-b-auto-red text-white focus:border-transparent focus:border-b-auto-red"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-96 p-2 px-4 bg-transparent outline-none border-b-2 border-transparent border-b-auto-red text-white focus:border-transparent focus:border-b-auto-red"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-96 p-2 px-4 bg-transparent outline-none border-b-2 border-transparent border-b-auto-red text-white focus:border-transparent focus:border-b-auto-red"
              />
              <input
                type="password"
                name="confirm_password"
                placeholder="Confirm Password"
                className="w-96 p-2 px-4 bg-transparent outline-none border-b-2 border-transparent border-b-auto-red text-white focus:border-transparent focus:border-b-auto-red"
              />
              <input
                type="submit"
                value="Sign Up ->"
                className="w-max bg-auto-red p-2 px-12 rounded-md text-white cursor-pointer"
              />
            </form>
            <p className="text-white">
              Already have an account?{" "}
              <Link href="/admin/login" className="text-auto-red">
                Login
              </Link>
            </p>
            <p className="text-white">
              <Link href="/resource/login" className="text-auto-red">
                Resource Login
              </Link>{" "}
              |{" "}
              <Link href="/client/login" className="text-auto-red">
                Client Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
