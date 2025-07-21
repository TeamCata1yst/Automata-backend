"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const api = process.env.APILINK;

type Props = {
  accessToken: string;
};

export default function Home({ accessToken }: Props) {
  const [counter, setCounter] = useState(1);
  const [loading, setLoading] = useState(true);

  const [avatar, setAvatar] = useState<string | null>(null);

  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const company_name = b.company;

  const addInput = () => {
    setCounter(counter + 1);
    // console.log(counter);
  };

  const submitForm = async (e: any) => {
    e.preventDefault();
    await Promise.all(
      Array.from(Array(counter)).map(async (c, i) => {
        const name = e.target[`department_${i}`].value;
        const res = await fetch(`${api}/admin/department/create`, {
          body: JSON.stringify({
            name: name,
          }),
          headers: {
            "Content-Type": "application/json",
            Token: accessToken,
          },
          method: "POST",
        });
        const result = await res.json();
        // console.log(result);
      }),
    );
    location.reload();
  };

  const [departments, setDepartments] = useState([]);

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

  const depts =
    departments.length > 0
      ? departments.map((dept, i) => {
          return (
            <div className="flex gap-4 items-center" key={i}>
              <input
                type="text"
                value={dept["name"]}
                readOnly
                className="text-white w-96"
              />
              <FontAwesomeIcon
                icon={faTrash as IconProp}
                className="text-white cursor-pointer"
                onClick={() => {
                  fetch(`${api}/admin/department/delete`, {
                    body: JSON.stringify({
                      name: dept["name"],
                    }),
                    headers: {
                      "Content-Type": "application/json",
                      Token: accessToken,
                    },
                    method: "POST",
                  })
                    .then((res) => {
                      return res.json();
                    })
                    .then((data) => {
                      if (data.status === "success") {
                        location.reload();
                      }
                    });
                }}
              />
            </div>
          );
        })
      : "";

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
          <form className="grid gap-6" onSubmit={submitForm}>
            <h3 className="font-primary text-white font-bold text-2xl">
              {company_name}
            </h3>

            <div className="border-l-3 border-white/60 max-w-md pl-4 grid gap-4">
              {depts}

              {Array.from(Array(counter)).map((c, i) => {
                return (
                  <input
                    type="text"
                    name={`department_${i}`}
                    className="w-96"
                    placeholder="Department Name"
                    key={i}
                  />
                );
              })}

              <input type="button" value="+" onClick={addInput} />
            </div>

            <div className="buttonBox">
              <input type="submit" />
            </div>
          </form>
        </>
      )}
    </>
  );
}
