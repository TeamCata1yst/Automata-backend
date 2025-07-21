"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTrash,
  faEdit,
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";

const api = process.env.APILINK;

type Props = {
  accessToken: string;
};

export default function Home({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const [workingHours, setWorkingHours] = useState(0);

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
  const [edit, setEdit] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${api}/org`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setWorkingHours(data.result.hours);
      });
  }, []);

  interface Project {
    id: string;
    name: string;
    client: string;
    city: string;
    template: string;
    buffer: string;
    remaining_time: number;
    priority: number;
  }

  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetch(`${api}/admin/project/`, {
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
        setProjects(data);
        setLoading(false);
      });
  }, []);

  projects.sort((a, b) => a["priority"] - b["priority"]);

  const [confimModalOpen, setConfirmModal] = useState(false);

  const openConfirmModal = (id: string) => {
    setConfirmModal(true);
    setDeleteId(id);
  };

  const time_display = (duration: number) => {
    var seconds = Math.floor((duration / 1000) % 60);
    var minutes = Math.floor((duration / (1000 * 60)) % 60);
    var hours = Math.floor((duration / (1000 * 60 * 60)) % workingHours);
    var days = Math.floor(duration / (1000 * 60 * 60 * workingHours));

    var hours_d = hours < 10 ? "0" + hours : hours;
    var minutes_d = minutes < 10 ? "0" + minutes : minutes;
    var seconds_d = seconds < 10 ? "0" + seconds : seconds;
    var days_d = days < 10 ? "0" + days : days;

    return days_d + "d " + hours_d + "h " + minutes_d + "m " + seconds_d + "s";
  };

  const [deleteId, setDeleteId] = useState("");

  const deleteProject = (id: string) => {
    fetch(`${api}/admin/project/delete`, {
      body: JSON.stringify({
        id: id,
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
  };

  const sendProject = () => {
    let prs: any = [];
    projects.forEach((pr, i) => {
      prs.push({
        id: pr.id,
        priority: pr.priority,
        name: pr.name,
      });
    });
    console.log(prs);
    fetch(`${api}/admin/project/priority`, {
      body: JSON.stringify({
        projects: prs,
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
        // console.log(data);
        if (data.status === "success") {
          location.reload();
        }
      });
  };

  return (
    <>
      <Navbar username={b.company} avatarUrl={avatar} />

      <div
        className={`fixed bg-black/50 backdrop-blur-[2px] inset-0 z-40 justify-center items-center flex transition duration-300 ${
          confimModalOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-[#0a0a0a] rounded-lg p-8 absolute w-4/5 z-50">
          <h1 className="font-primary text-white font-bold text-4xl">
            Confirm Delete
          </h1>
          <hr className="w-20 border-3 border-auto-red my-6" />
          <div className="max-h-96 overflow-y-scroll scrollbar-thin scrollbar-track-[#0a0a0a] scrollbar-thumb-white/20">
            <p className="text-white">
              Are you sure you want to delete this project?
            </p>
            <div className="flex gap-4 mt-4">
              <button
                className="submitButton"
                onClick={() => deleteProject(deleteId)}
              >
                Yes
              </button>
              <button
                className="cancelButton"
                onClick={() => {
                  setConfirmModal(false);
                  setDeleteId("");
                }}
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      <h1 className="font-primary text-white font-bold text-4xl">Projects</h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <button className="cancelButton" onClick={() => setEdit(true)}>
            <FontAwesomeIcon icon={faEdit as IconProp} /> Edit Priority
          </button>

          {edit && (
            <div className="buttonBox">
              <button className="submitButton" onClick={sendProject}>
                {" "}
                Save Changes{" "}
              </button>
              <button
                onClick={() => location.reload()}
                className="cancelButton"
              >
                Cancel
              </button>
            </div>
          )}

          <div className="flex overflow-x-scroll gap-4 py-4 mb-4 scrollbar-thin scrollbar-track-[#0a0a0a] scrollbar-thumb-white/20 max-w-[82vw]">
            {projects.map((pr, i) => {
              return (
                <div
                  className="w-[19rem] flex-shrink-0 bg-black text-white p-6 rounded-lg flex flex-col justify-between"
                  key={i}
                >
                  <div>
                    <h3
                      title={pr["name"]}
                      className="font-primary text-white font-bold text-xl text-center pb-1"
                    >
                      {pr["name"]}
                    </h3>
                    <div className="w-full space-x-3 text-center ">
                      <FontAwesomeIcon
                        icon={faTrash as IconProp}
                        className="text-white cursor-pointer"
                        onClick={() => {
                          openConfirmModal(pr["id"]);
                        }}
                      />
                      <FontAwesomeIcon
                        icon={faEdit as IconProp}
                        className="text-white cursor-pointer"
                        onClick={() => {
                          location.replace(`/admin/projects/${pr["id"]}`);
                        }}
                      />
                    </div>
                  </div>

                  <hr className="w-20 border-3 border-auto-red my-4 mx-auto" />

                  <div>
                    <p className="font-light text-xs pb-1">Client:</p>
                    <h4 className="text-white pb-2 font-bold text-lg">
                      {pr["client"]}
                    </h4>
                    <p className="font-light text-xs pb-1">Location:</p>
                    <h4 className="text-white pb-2 font-bold text-lg">
                      {pr["city"]}
                    </h4>
                    <p className="font-light text-xs pb-1">Template:</p>
                    <h4 className="text-white pb-2 font-bold text-lg">
                      {pr["template"]}
                    </h4>
                    <p className="font-light text-xs pb-1">Buffer:</p>
                    <h4 className="text-white pb-2 font-bold text-lg">
                      {pr["buffer"]}
                    </h4>
                    <p className="font-light text-xs pb-1">Time Remaining:</p>
                    <h4 className="text-white pb-2 font-bold text-lg">
                      {time_display(pr["remaining_time"])}
                    </h4>
                  </div>

                  <div className="w-full">
                    <p className="w-auto text-xs py-2 text-center">
                      Change Priority
                    </p>
                    <div className="flex justify-between items-center">
                      <button
                        className="w-8 h-8 bg-auto-red rounded-full"
                        disabled={pr["priority"] === 0 || !edit}
                        onClick={() => {
                          let new_priority = pr["priority"] - 1;
                          let projects_edit = [...projects];
                          // console.log(projects_edit[pr['priority']], projects_edit[new_priority]);
                          projects_edit[new_priority]["priority"] =
                            pr["priority"];
                          projects_edit[pr["priority"]]["priority"] =
                            new_priority;
                          setProjects(projects_edit);

                          // fetch(`${api}/admin/project/priority`, {
                          //   body: JSON.stringify({
                          //     id: pr['id'],
                          //     priority: pr['priority'],
                          //     inc: false
                          //   }),
                          //   headers: {
                          //     'Content-Type': 'application/json',
                          //     'Token': accessToken,
                          //   },
                          //   method: 'POST',
                          // })
                          // .then (
                          //   (res) => { return res.json(); }
                          // ).then (
                          //   (data) => { if(data.status === 'success') {location.reload()} }
                          // );
                        }}
                      >
                        <FontAwesomeIcon icon={faChevronLeft as IconProp} />
                      </button>
                      <select
                        disabled={!edit}
                        name="priority"
                        value={pr["priority"]}
                        onChange={(e) => {
                          e.preventDefault();
                          let new_priority = parseInt(e.target.value);
                          let current_priority = pr["priority"];
                          // console.log(new_priority, pr['priority']);
                          let projects_edit = [...projects];
                          projects_edit[current_priority]["priority"] =
                            new_priority;
                          if (new_priority === current_priority) return;
                          if (new_priority < current_priority) {
                            // console.log('down');
                            projects_edit
                              .filter((p) => p.id !== pr.id)
                              .forEach((p) => {
                                if (
                                  p.priority >= new_priority &&
                                  p.priority < current_priority
                                ) {
                                  p["priority"] += 1;
                                }
                              });
                          } else {
                            // console.log('up');
                            projects_edit
                              .filter((p) => p.id !== pr.id)
                              .forEach((p) => {
                                if (
                                  p.priority <= new_priority &&
                                  p.priority > current_priority
                                ) {
                                  p["priority"] -= 1;
                                }
                              });
                          }
                          // console.log(projects_edit);
                          setProjects(projects_edit);
                        }}
                        className="w-max py-2"
                      >
                        {projects.map((p, i) => {
                          return (
                            <option key={i} value={p["priority"]}>
                              {p["priority"] + 1}
                            </option>
                          );
                        })}
                      </select>
                      {/* <span>Change Priority</span> */}

                      <button
                        className="w-8 h-8 bg-auto-red rounded-full"
                        disabled={
                          pr["priority"] === projects.length - 1 || !edit
                        }
                        onClick={() => {
                          let new_priority = pr["priority"] + 1;
                          let projects_edit = [...projects];
                          // console.log(projects_edit[pr['priority']], projects_edit[new_priority]);
                          projects_edit[new_priority]["priority"] =
                            pr["priority"];
                          projects_edit[pr["priority"]]["priority"] =
                            new_priority;
                          setProjects(projects_edit);

                          // fetch(`${api}/admin/project/priority`, {
                          //   body: JSON.stringify({
                          //     id: pr['id'],
                          //     priority: pr['priority'],
                          //     inc: true
                          //   }),
                          //   headers: {
                          //     'Content-Type': 'application/json',
                          //     'Token': accessToken,
                          //   },
                          //   method: 'POST',
                          // })
                          // .then (
                          //   (res) => { return res.json(); }
                          // ).then (
                          //   (data) => { if(data.status === 'success') {location.reload()} }
                          // );
                        }}
                      >
                        <FontAwesomeIcon icon={faChevronRight as IconProp} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            href="/admin/projects/create"
            className="w-80 bg-[#343434]/30 text-white p-4 rounded-md flex justify-center items-center"
          >
            <span className="font-semibold leading-tightest">
              {" "}
              New Project +
            </span>
          </Link>
        </>
      )}
    </>
  );
}
