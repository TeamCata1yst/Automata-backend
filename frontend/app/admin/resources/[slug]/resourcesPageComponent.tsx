"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faUserEdit } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const api = process.env.NEXT_PUBLIC_APILINK;

type Props = {
  accessToken: string;
  d_id: string;
};

export default function Home({ accessToken, d_id }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const [counter, setCounter] = useState(0);

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

  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState([
    {
      id: "",
      name: "",
      email: "",
      mobile_no: "",
      password: "",
      gender: false,
      edit: false,
    },
  ]);

  const addRow = () => {
    setCounter(counter + 1);
    //   console.log(counter);
  };

  const submitForm = async (e: any) => {
    e.preventDefault();

    resources.map((r, i) => {
      const name = r.name;
      const email = r.email;
      const mobile_no = r.mobile_no;
      const gender = r.gender;
      const id = r.id;
      const password = r.password;
      fetch(`${api}/admin/user/edit`, {
        body: JSON.stringify({
          id: id,
          name: name,
          email: email,
          mobile_no: mobile_no,
          gender: gender,
          password: password,
        }),
        headers: {
          "Content-Type": "application/json",
          Token: accessToken,
        },
        method: "POST",
      });
    });

    if (counter > 0) {
      if (
        e.target[`res_0_name`].value === "" &&
        e.target[`res_0_email`].value === "" &&
        e.target[`res_0_mobile`].value === "" &&
        e.target[`res_0_gender`].value === "none" &&
        e.target[`res_0_password`].value === ""
      ) {
      } else {
        if (
          e.target[`res_0_name`].value === "" ||
          e.target[`res_0_email`].value === "" ||
          e.target[`res_0_mobile`].value === "" ||
          e.target[`res_0_gender`].value === "none" ||
          e.target[`res_0_password`].value === ""
        ) {
          alert("Please fill all the fields");
          return;
        }
        await Promise.all(
          Array.from(Array(counter)).map(async (c, i) => {
            if (
              e.target[`res_${i}_name`].value === "" &&
              e.target[`res_${i}_email`].value === "" &&
              e.target[`res_${i}_mobile`].value === "" &&
              e.target[`res_${i}_gender`].value === "none" &&
              e.target[`res_${i}_password`].value === ""
            ) {
            } else {
              if (
                e.target[`res_${i}_name`].value === "" ||
                e.target[`res_${i}_email`].value === "" ||
                e.target[`res_${i}_mobile`].value === "" ||
                e.target[`res_${i}_gender`].value === "none" ||
                e.target[`res_${i}_password`].value === ""
              ) {
                alert("Please fill all the fields");
                return;
              } else {
                const name = e.target[`res_${i}_name`].value;
                const gender = e.target[`res_${i}_gender`].value === "F";
                const mobile_no = e.target[`res_${i}_mobile`].value;
                const email = e.target[`res_${i}_email`].value;
                const password = e.target[`res_${i}_password`].value;
                const res = await fetch(`${api}/admin/user/create`, {
                  body: JSON.stringify({
                    name: name,
                    department: d_id,
                    gender: gender,
                    mobile_no: mobile_no,
                    email: email,
                    password: password,
                  }),
                  headers: {
                    "Content-Type": "application/json",
                    Token: accessToken,
                  },
                  method: "POST",
                });
                const result = await res.json();
                if (result.status !== "success") {
                  alert(`Error: ${result.message}`);
                  return;
                }
              }
            }
          }),
        );
      }
    }

    location.reload();
  };

  useEffect(() => {
    const GetDept = (dept: string) => {
      fetch(`${api}/admin/user/${dept}`, {
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
          } else if (data.status !== "success") {
            location.replace("/admin/resources");
          } else {
            setResources(data.result);
            setLoading(false);
          }
        });
    };
    GetDept(d_id);
  }, []);

  const deleteUser = async (id: string) => {
    const res = await fetch(`${api}/admin/user/delete`, {
      body: JSON.stringify({
        id: id,
        department: d_id,
      }),
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
    });
    const result = await res.json();
    if (result.status !== "success") {
      alert(`Error: ${result.message}`);
      return;
    }
    location.reload();
  };

  useEffect(() => {
    console.log(resources);
  }, [resources]);

  return (
    <>
      <Navbar username={b.company} avatarUrl={avatar} />
      <h1 className="font-primary text-white font-bold text-4xl">{d_id}</h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <form onSubmit={submitForm} id="resource-form">
            <table className="table-auto text-white w-full border-collapse border border-white/40 mb-6">
              <thead className="bg-black">
                <tr>
                  <th className="border border-white/40 p-3">Name</th>
                  <th className="border border-white/40 p-3">Email</th>
                  <th className="border border-white/40 p-3">Mobile</th>
                  <th className="border border-white/40 p-3">Password</th>
                  <th className="border border-white/40 p-3">Gender</th>
                  <th className="border border-white/40 p-3">Delete</th>
                  <th className="border border-white/40 p-3">Edit</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r, i) => {
                  return (
                    <tr key={i}>
                      <td className="border border-white/40">
                        <input
                          type="text"
                          className="border-0 rounded-none text-white/70"
                          readOnly={!r.edit}
                          value={r["name"]}
                          onChange={(e) => {
                            resources[i].name = e.target.value;
                            setResources([...resources]);
                          }}
                        />
                      </td>
                      <td className="border border-white/40">
                        <input
                          type="email"
                          className="border-0 rounded-none text-white/70"
                          readOnly={!r.edit}
                          value={r["email"]}
                          onChange={(e) => {
                            resources[i].email = e.target.value;
                            setResources([...resources]);
                          }}
                        />
                      </td>
                      <td className="border border-white/40">
                        <input
                          type="text"
                          className="border-0 rounded-none text-white/70"
                          readOnly={!r.edit}
                          value={r["mobile_no"]}
                          onChange={(e) => {
                            resources[i].mobile_no = e.target.value;
                            setResources([...resources]);
                          }}
                        />
                      </td>
                      <td className="border border-white/40">
                        <input
                          type="text"
                          className="border-0 rounded-none text-white/70"
                          readOnly={!r.edit}
                          value={r["password"]}
                          onChange={(e) => {
                            resources[i].password = e.target.value;
                            setResources([...resources]);
                          }}
                        />
                      </td>
                      <td className="border border-white/40">
                        {!r.edit ? (
                          <input
                            type="text"
                            className="border-0 rounded-none text-white/70 w-32"
                            value={r["gender"] ? "F" : "M"}
                            readOnly={!r.edit}
                            onChange={(e) => {
                              resources[i].gender = e.target.value == "F";
                              setResources([...resources]);
                            }}
                          />
                        ) : (
                          <select
                            className="border-0 rounded-none text-white/70 w-32 bg-transparent"
                            value={r["gender"].toString()}
                            onChange={(e) => {
                              resources[i].gender = e.target.value == "true";
                              setResources([...resources]);
                            }}
                          >
                            <option value="false">M</option>
                            <option value="true">F</option>
                          </select>
                        )}
                      </td>
                      <td
                        className="border border-white/40 text-white/60 hover:text-white/70 transition cursor-pointer text-center"
                        onClick={() => deleteUser(r["id"])}
                      >
                        <FontAwesomeIcon icon={faTrash as IconProp} />
                      </td>
                      <td
                        className="border border-white/40 text-white/60 hover:text-white/70 transition cursor-pointer text-center"
                        onClick={() => {
                          resources[i].edit = true;
                          setResources([...resources]);
                        }}
                      >
                        <FontAwesomeIcon icon={faUserEdit as IconProp} />
                      </td>
                    </tr>
                  );
                })}
                {Array.from(Array(counter)).map((c, i) => {
                  return (
                    <tr key={i}>
                      <td className="border border-white/40">
                        <input
                          type="text"
                          className="border-0 rounded-none text-white/70"
                          name={`res_${i}_name`}
                          placeholder="Name"
                        />
                      </td>
                      <td className="border border-white/40">
                        <input
                          type="email"
                          className="border-0 rounded-none text-white/70"
                          name={`res_${i}_email`}
                          placeholder="Email"
                        />
                      </td>
                      <td className="border border-white/40">
                        <input
                          type="text"
                          className="border-0 rounded-none text-white/70"
                          name={`res_${i}_mobile`}
                          placeholder="Mobile"
                        />
                      </td>
                      <td className="border border-white/40">
                        <input
                          type="text"
                          className="border-0 rounded-none text-white/70"
                          name={`res_${i}_password`}
                          placeholder="Password"
                        />
                      </td>
                      <td className="border border-white/40">
                        {/* <input type="text" className='border-0 rounded-none text-white/70 w-32' name={`res_${i}_gender`} placeholder='Gender'/> */}
                        <select
                          className="border-0 rounded-none text-white/70 w-32 bg-transparent"
                          name={`res_${i}_gender`}
                        >
                          <option value="none">Gender</option>
                          <option value="false">M</option>
                          <option value="true">F</option>
                        </select>
                      </td>
                      <td className="border border-white/40"></td>
                      <td className="border border-white/40"></td>
                    </tr>
                  );
                })}
                <tr className="bg-black">
                  <td
                    colSpan={7}
                    onClick={addRow}
                    className="p-2 text-center text-lg w-full cursor-pointer"
                  >
                    +
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="buttonBox">
              <input type="submit" value="Save" />
            </div>
          </form>
        </>
      )}
    </>
  );
}
