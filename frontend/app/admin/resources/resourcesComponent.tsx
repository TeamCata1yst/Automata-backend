"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

const api = process.env.NEXT_PUBLIC_APILINK;

type Props = {
  accessToken: string;
};

export default function Home({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    fetch(`${api}/org/${b.company}/logo`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        const bytes = atob(data.logo);
        const bytenums = bytes.split("").map((char) => char.charCodeAt(0));
        const bytearr = new Uint8Array(bytenums);
        setAvatar(URL.createObjectURL(new File([bytearr], "avatar.png")));
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);
  useEffect(() => {
    fetch(`${api}/admin/department/`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "GET",
    })
      .then((res) => {
        return res.json();
      })
      .then(async (data) => {
        if (data.status === "unauthorized") {
          const res_l = await fetch("/api/logout");
          const data_l = await res_l.json();
          if (data_l.status === "200") {
            location.replace("/admin/login");
          }
        }
        setDepartments(data.result);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Navbar username={b.company} avatarUrl={avatar} />
      <h1 className="font-primary text-white font-bold text-4xl">
        Departments
      </h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <div className="flex flex-col gap-4 w-2/5">
            {departments.map((d, i) => {
              return (
                <Link
                  className="p-4 text-white bg-black hover:bg-[#343434]/40 transition duration-300"
                  href={`/admin/resources/${d["name"]}`}
                  key={i}
                >
                  {d["name"]}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
