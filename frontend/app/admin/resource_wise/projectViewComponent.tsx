"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Link from "next/link";

type Props = {
  accessToken: string;
};

const api = process.env.APILINK;

export default function Home({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const [departments, setDepartments] = useState([
    {
      id: "none",
      name: "Select Department",
    },
  ]);

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
  const [resources, setResources] = useState([
    {
      id: "none",
      name: "Select Resource",
    },
  ]);

  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState("none");
  const [resource, setResource] = useState("none");
  const [projects, setProjects] = useState<any>();

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
      .then((data) => {
        setDepartments([...departments, ...data.result]);
        setLoading(false);
      });
  }, []);

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
      .then((data) => {
        setResources([{ id: "none", name: "Select Resource" }, ...data.result]);
      });
  };

  useEffect(() => {
    if (department === "none") {
      setResources([]);
      setTasks([]);
      return;
    }
    setTasks([]);
    GetDept(department);
    const resource_select = document.getElementById(
      "resource_select",
    ) as HTMLSelectElement;
    resource_select.selectedIndex = 0;
  }, [department]);

  useEffect(() => {
    if (resource === "none") {
      setTasks([]);
      return;
    }
    setTasks([]);
    GetTasks(resource);
  }, [resource]);

  const [tasks, setTasks] = useState([
    {
      project_name: "",
      name: "",
      deadline: "",
      status: 0,
      remark: "",
    },
  ]);

  const GetTasks = (id: string) => {
    fetch(`${api}/admin/user/tasks`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
      body: JSON.stringify({
        id: id,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        setTasks(data.result);
        console.log(data.result);
      });
  };

  useEffect(() => {
    let projects: string[] = [];
    tasks.forEach((t) => {
      if (!projects.includes(t.project_name)) {
        projects.push(t.project_name);
      }
    });
    // console.log(projects);
    setProjects(projects);
  }, [tasks]);

  const t_n = new Date();

  return (
    <>
      <Navbar username={b.company} avatarUrl={avatar} />

      <h1 className="font-primary text-white font-bold text-4xl">Task View</h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      <div className="flex justify-between items-center">
        <div className="space-x-3">
          <Link href="/admin/" className="bg-auto-red/50 cancelButton">
            Project Wise
          </Link>
          <Link
            href="/admin/resource_wise"
            className="bg-auto-red cancelButton"
          >
            Resource Wise
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-[#1f009d]"></div>
            <small className="text-white">In progress</small>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-[#155303]"></div>
            <small className="text-white">Completed</small>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-[#95050d]"></div>
            <small className="text-white">Exceeded deadline</small>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 bg-[#9aa109]"></div>
            <small className="text-white">Completed within buffer</small>
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <div className="flex gap-3 my-4">
            <select
              name="department"
              id="department_select"
              className="w-96"
              onChange={(e) => {
                setDepartment(e.target.value);
              }}
            >
              {departments.map((d, i) => {
                return (
                  <option value={d.id} key={i}>
                    {d.name}
                  </option>
                );
              })}
            </select>
            <select
              name="resource"
              id="resource_select"
              className="w-96"
              onChange={(e) => {
                setResource(e.target.value);
              }}
            >
              {resources.length === 0 ? (
                <option value="none">Select Resource</option>
              ) : (
                resources.map((r, i) => {
                  return (
                    <option value={r.id} key={i}>
                      {r.name}
                    </option>
                  );
                })
              )}
            </select>
          </div>

          {resource === "none" ? (
            ""
          ) : tasks.length > 0 ? (
            <>
              <h3 className="text-white font-semibold text-xl pb-4">
                Tasks assigned to{" "}
                {resources.filter((r) => r.id == resource)[0].name}
              </h3>
              {projects.map((p: string, i: number) => (
                <div key={i}>
                  <h4 className="text-white font-semibold py-4">{p}</h4>
                  <div className="grid grid-cols-6 gap-3">
                    {tasks
                      .filter((t) => t.project_name == p)
                      .map((t, i) => {
                        return t.name == "" ? (
                          ""
                        ) : (
                          <div
                            className={
                              "bg-black p-3 h-max rounded-lg text-white border-3 border-[#252525] text-sm"
                            }
                            key={i}
                            style={
                              t.status === 1
                                ? { backgroundColor: "#155303" } //green
                                : t.status === 2
                                  ? { backgroundColor: "#9aa109" } //yellow-green
                                  : t.status === -1
                                    ? { backgroundColor: "#95050d" } //red
                                    : Date.parse(t.deadline) <
                                        Date.parse(t_n.toString())
                                      ? { backgroundColor: "#95050d" } //red
                                      : t.status === 4
                                        ? { backgroundColor: "#1f009d" } //blue
                                        : {}
                            }
                          >
                            <small>{t.project_name}</small>
                            <br />
                            <b>{t.name}</b>
                            <br />
                            <small>
                              <b>Deadline:</b>{" "}
                              {`${new Date(t.deadline).getDate()}-${
                                new Date(t.deadline).getMonth() + 1
                              }-${new Date(t.deadline).getFullYear()}`}
                            </small>
                            <br />
                            {t.status === -1 ? (
                              <small>
                                <b>Remark: </b>
                                {t.remark}
                              </small>
                            ) : (
                              ""
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="text-white">No tasks assigned</div>
          )}
        </>
      )}
    </>
  );
}
