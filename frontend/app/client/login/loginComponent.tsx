"use client";
import Navbar from "@/components/Navbar";
import Video from "@/components/Video";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_APILINK;

export default function Home() {
  const [companies, setCompanies] = useState([]);

  const submitForm = async (e: any) => {
    e.preventDefault();
    if (e.target.company.value === "none") {
      alert("Please select a company");
      return;
    }
    const company = e.target.company.value;
    const email = e.target.email.value;
    const pass = e.target.password.value;
    const res = await fetch("/api/login/client", {
      body: JSON.stringify({
        company: company,
        email: email,
        password: pass,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = await res.json();
    console.log(data);
    if (data.error) {
      alert(data.error);
    } else {
      location.replace("/client");
    }
  };

  useEffect(() => {
    fetch(`${api}/org/list`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setCompanies(data.result);
        } else {
          alert("No companies found");
        }
      });
  }, []);

  return (
    <>
      <Navbar instance="login" />

      <div className="flex -m-32 -mt-48">
        <div className="w-full min-h-screen flex items-center justify-center bg-[#010101]">
          <div className="flex flex-col gap-6 z-10 items-center py-12 px-24 rounded-lg bg-white/5">
            <h1 className="font-primary text-white font-bold text-4xl">
              Client Login
            </h1>
            <hr className="w-20 border-3 border-auto-red" />
            <form
              onSubmit={submitForm}
              className="flex flex-col gap-6 items-center"
            >
              <select
                name="company"
                className="w-96 p-2 px-4 bg-transparent outline-none border-b-2 border-transparent border-b-auto-red text-white focus:border-transparent focus:border-b-auto-red"
              >
                <option value="none">Company</option>
                {companies.map((company, i) => {
                  return (
                    <option key={i} value={company}>
                      {company}
                    </option>
                  );
                })}
              </select>
              <input
                type="email"
                name="email"
                placeholder="Email ID"
                className="w-96 p-2 px-4 bg-transparent outline-none border-b-2 border-transparent border-b-auto-red text-white focus:border-transparent focus:border-b-auto-red"
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="w-96 p-2 px-4 bg-transparent outline-none border-b-2 border-transparent border-b-auto-red text-white focus:border-transparent focus:border-b-auto-red"
              />
              <input
                type="submit"
                value="Login ->"
                className="w-max bg-auto-red p-2 px-12 rounded-md text-white cursor-pointer"
              />
              <p className="text-white">
                <Link href="/admin/login" className="text-auto-red">
                  Admin Login
                </Link>{" "}
                |{" "}
                <Link href="/resource/login" className="text-auto-red">
                  Resource Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
