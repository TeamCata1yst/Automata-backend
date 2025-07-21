"use client";
import Navbar from "@/components/Navbar";
import Video from "@/components/Video";
import Footer from "@/components/Footer";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_APILINK;

export default function Home() {
  const submitForm = async (e: any) => {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;
    const res = await fetch("/api/login/admin", {
      body: JSON.stringify({
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
      location.replace("/admin");
    }
  };

  return (
    <>
      <Navbar instance="login" />
      <div className="flex -m-32 -mt-48">
        <div className="w-full min-h-screen flex items-center justify-center bg-[#010101]">
          <div className="flex flex-col gap-6 z-10 items-center py-12 px-24 rounded-lg bg-white/5 relative">
            <h1 className="font-primary text-white font-bold text-4xl">
              Admin Login
            </h1>
            <hr className="w-20 border-3 border-auto-red" />
            <form
              className="flex flex-col gap-6 items-center"
              onSubmit={submitForm}
            >
              <input
                type="email"
                name="email"
                placeholder="Email"
                id="userInput"
                className="w-96 p-2 px-4 bg-transparent outline-none border-transparent border-b-2 border-b-auto-red text-white focus:border-transparent focus:border-b-auto-red"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                id="passInput"
                className="w-96 p-2 px-4 bg-transparent outline-none border-b-2 border-transparent border-b-auto-red text-white focus:border-transparent focus:border-b-auto-red"
              />
              <input
                type="submit"
                value="Login ->"
                className="w-max bg-auto-red p-2 px-12 rounded-md text-white cursor-pointer"
              />
            </form>
            <p className="text-white">
              Don&lsquo;t have an account?{" "}
              <Link href="/admin/signup" className="text-auto-red">
                Sign Up
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
