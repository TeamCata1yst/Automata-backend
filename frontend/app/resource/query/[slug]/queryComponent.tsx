"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { use, useEffect, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faAngleDoubleRight } from "@fortawesome/free-solid-svg-icons";

const api = process.env.NEXT_PUBLIC_APILINK;

type Props = {
  accessToken: string;
  q_id: string;
};

export default function Query({ accessToken, q_id }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const res_id = b.id;

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

  const [days, setDays] = useState<any>([]);

  const [q_task, setQ_task] = useState<any>({});

  const [resources, setResources] = useState<any>([]);

  const [taskModalOpen, setTaskModalOpen] = useState(false);

  const [transfer, setTransfer] = useState(false);

  const [counter, setCounter] = useState(0);

  const [query, setQuery] = useState<any>({});

  const [p_tasks, setP_tasks] = useState<any>([]);

  const [remark, setRemark] = useState(false);

  useEffect(() => {
    //? Fetching query details
    fetch(`${api}/user/query/${q_id}`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setQuery(data.result);
      })
      .catch((error) => console.error(error));

    //? Fetching resources
    fetch(`${api}/user/query/users`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setResources(data.result);
      })
      .catch((error) => console.error(error));

    //? Fetching days
    fetch(`${api}/user/project/`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setDays(data);
        setLoading(false);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    let tasks: any = [];
    // console.log(days);
    days.forEach((d: any) => {
      d.tasks.forEach((t: any) => {
        if (t.query) return;
        tasks.push(t);
      });
    });
    setP_tasks(tasks);
    if (query.task?.name) {
      let q_tasks: any = [];
      days.forEach((d: any) => {
        d.tasks.forEach((t: any) => {
          if (t.query_id == q_id) {
            q_tasks.push(t);
          }
        });
      });
      setQ_task(q_tasks[0]);
    }
  }, [days]);

  // useEffect(() => {
  //   console.log(q_task);
  // }, [q_task]);

  const time_display = (duration: number) => {
    var seconds = Math.floor((duration / 1000) % 60);
    var minutes = Math.floor((duration / (1000 * 60)) % 60);
    var hours = Math.floor(duration / (1000 * 60 * 60));

    var hours_d = hours < 10 ? "0" + hours : hours;
    var minutes_d = minutes < 10 ? "0" + minutes : minutes;
    var seconds_d = seconds < 10 ? "0" + seconds : seconds;

    return +hours_d + ":" + minutes_d + ":" + seconds_d;
  };

  const sendTaskStatus = async (e: any) => {
    e.preventDefault();
    let task_status;
    if (e.target.task_status.value == "none") task_status = 0;
    if (e.target.task_status.value == "1") task_status = 1;
    if (e.target.task_status.value == "4") task_status = 4;
    try {
      fetch(`${api}/user/query/task/resolve`, {
        body: JSON.stringify({
          status: task_status,
          query_id: query.id,
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
          if (data.status == "success") {
            location.reload();
          } else {
            alert(data);
          }
        });
    } catch (error) {
      alert(error);
    }
  };

  const resolveQuery = async (e: any) => {
    e.preventDefault();
    const remark = e.target.remark.value;
    const res = await fetch(`${api}/user/query/resolve`, {
      body: JSON.stringify({
        remark: remark,
        query_id: query.id,
      }),
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
    });
    const data = await res.json();
    if (data.status === "success") {
      location.replace("/resource");
    }
  };

  const cancelButton = (e: any) => {
    e.preventDefault();
    e.target.form.reset();
    setCounter(0);
    setTaskModalOpen(false);
  };

  const handleTaskCreate = (e: any) => {
    e.preventDefault();
    setTaskModalOpen(true);
  };

  const time_convert = (time: string) => {
    if (time.split(":").length !== 3) {
      return 1;
    }
    const h = Number(time.split(":")[0]);
    const m = Number(time.split(":")[1]);
    const s = Number(time.split(":")[2]);
    const converted_time = h * 3600000 + m * 60000 + s * 1000;
    if (converted_time > 0) {
      return converted_time;
    } else {
      return 1;
    }
  };

  const handleTransfer = async (e: any) => {
    e.preventDefault();
    const transfer = e.target.transfer.value;
    if (transfer === "none") {
      alert("Select a resource to transfer query");
      return;
    }
    console.log(transfer);
    const res = await fetch(`${api}/user/query/transfer`, {
      body: JSON.stringify({
        resource_id: transfer,
        query_id: query.id,
      }),
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
    });
    const data = await res.json();
    if (data.status === "success") {
      location.replace("/resource");
    } else {
      alert(data.message);
    }
  };

  // useEffect(() => {
  //   console.log(p_tasks);
  // }, [p_tasks]);

  const handleTaskReq = async (e: any) => {
    e.preventDefault();
    const task_name = e.target.task_name.value;
    const time_req = time_convert(e.target.time_req.value);
    const task_after = e.target.task_after.value;
    const checklist = [];
    if (task_after === "none") {
      alert("Select a task to insert after");
      return;
    }
    for (let i = 0; i < counter; i++) {
      if (e.target[`e_item_${i}`].value === "") return;
      checklist.push(e.target[`e_item_${i}`].value);
    }
    const task = {
      name: task_name,
      time_req: time_req,
      checklist: checklist,
      selected_resource: res_id,
      before_id: task_after,
    };
    console.log(task);
    const res = await fetch(`${api}/user/query/task`, {
      body: JSON.stringify({
        task: task,
        query_id: q_id,
      }),
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
    });
    const data = await res.json();
    if (data.status === "success") {
      location.replace("/resource");
    }
  };

  return (
    <>
      <Navbar
        instance="resource-query"
        username={b.company}
        avatarUrl={avatar}
      />

      <div
        className={`fixed bg-black/50 backdrop-blur-[2px] inset-0 z-40 justify-center items-center flex transition duration-500 ${
          taskModalOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-[#0a0a0a] rounded-lg p-8 absolute w-4/5 z-50">
          <h1 className="font-primary text-white font-bold text-4xl">
            Task Creation
          </h1>
          <hr className="w-20 border-3 border-auto-red my-6" />
          <form className="grid md:grid-cols-2 gap-10" onSubmit={handleTaskReq}>
            <div className="flex flex-col gap-6">
              <input
                type="text"
                name="task_name"
                placeholder="Task Name"
                required
              />
              <input
                type="text"
                name="time_req"
                placeholder="Time Required (HH:MM:SS)"
                required
              />
              <select name="task_after">
                <option value="none">Insert Task after</option>
                {p_tasks.map((t: any, i: any) => {
                  return (
                    <option key={i} value={`${t.project_id}_${t.task_id}`}>
                      {t.project_name} - {t.name}
                    </option>
                  );
                })}
                {p_tasks.length == 0 ? (
                  <option value="0">No tasks available, insert as 1st</option>
                ) : (
                  <></>
                )}
              </select>
            </div>
            <div className="flex flex-col gap-6">
              <h3 className="font-primary text-white font-bold text-2xl">
                Checklist Creation
              </h3>
              <div className="border-l-3 border-white/60 max-w-md pl-4 grid gap-4 max-h-80 overflow-y-scroll scrollbar-thin scrollbar-track-[#0a0a0a] scrollbar-thumb-white/20">
                {Array.from(Array(counter)).map((c, i) => {
                  return (
                    <div className="flex items-center gap-4" key={i}>
                      <input
                        type="text"
                        name={`e_item_${i}`}
                        placeholder="Item Name"
                        className="w-96"
                      />
                    </div>
                  );
                })}
                <input
                  type="button"
                  value="+"
                  onClick={() => {
                    setCounter(counter + 1);
                  }}
                />
              </div>
            </div>
            <div className="space-x-2">
              <input type="submit" value="Create" />
              <button onClick={cancelButton} className="cancelButton">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>

      {query.task?.name ? (
        <>
          <h1 className="font-primary text-white font-bold text-4xl flex items-center gap-3">
            {query.project_name}{" "}
            <FontAwesomeIcon
              icon={faAngleDoubleRight as IconProp}
              className="h-6"
            />{" "}
            {query.task?.name}
          </h1>
          <hr className="w-20 border-3 border-auto-red my-6" />
          {loading ? (
            <p className="text-white">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="py-2 text-white flex flex-col gap-4">
                  <p>
                    <span className="font-semibold underline underline-offset-2 decoration-auto-red">
                      Query Title:{" "}
                    </span>
                    {query.subject}
                  </p>
                  <p className="pb-4">
                    <span className="font-semibold underline underline-offset-2 decoration-auto-red">
                      Query Description:{" "}
                    </span>
                    {query.description}
                  </p>
                  {query.task?.status == 1 || query.task?.status == 2 ? (
                    <></>
                  ) : (
                    <p>
                      <span className="font-semibold underline underline-offset-2 decoration-auto-red decoration-2">
                        Deadline:
                      </span>{" "}
                      {`${new Date(q_task?.deadline).getDate()}-${
                        new Date(q_task?.deadline).getMonth() + 1
                      }-${new Date(q_task?.deadline).getFullYear()}`}
                    </p>
                  )}
                  {query.task?.status == 1 || query.task?.status == 2 ? (
                    <p className="font-semibold">Task Completed</p>
                  ) : query.task?.status == 4 ? (
                    <>
                      <p>
                        <span className="font-semibold underline underline-offset-2 decoration-auto-red decoration-2">
                          Time Required for Task:
                        </span>{" "}
                        {time_display(Number(query.task?.time_req))}
                      </p>
                      <form onSubmit={sendTaskStatus}>
                        <select
                          className="w-64"
                          name="task_status"
                          onChange={(e) => {
                            if (e.target.value == "-1") {
                              setRemark(true);
                            } else {
                              setRemark(false);
                            }
                          }}
                        >
                          <option value="none">Started</option>
                          <option value="1">Completed</option>
                        </select>
                        <input
                          type="submit"
                          value="Update Task"
                          className="mx-4 w-max"
                        />
                        {remark ? (
                          <input
                            type="text"
                            name="remark"
                            placeholder="Enter Remark"
                            className="w-[32.25rem] mt-4"
                            required
                          />
                        ) : (
                          <></>
                        )}
                      </form>
                    </>
                  ) : (
                    <>
                      <p>
                        <span className="font-semibold underline underline-offset-2 decoration-auto-red decoration-2">
                          Time Required for Task:
                        </span>{" "}
                        {time_display(Number(query.task?.time_req))}
                      </p>
                      <form onSubmit={sendTaskStatus}>
                        <select
                          className="w-64"
                          name="task_status"
                          onChange={(e) => {
                            if (e.target.value == "-1") {
                              setRemark(true);
                            } else {
                              setRemark(false);
                            }
                          }}
                        >
                          <option value="none">Not Started</option>
                          <option value="4">Started</option>
                          <option value="1">Completed</option>
                        </select>
                        <input
                          type="submit"
                          value="Update Task"
                          className="mx-4 w-max"
                        />
                        {remark ? (
                          <input
                            type="text"
                            name="remark"
                            placeholder="Enter Remark"
                            className="w-[32.25rem] mt-4"
                            required
                          />
                        ) : (
                          <></>
                        )}
                      </form>
                    </>
                  )}
                </div>
                <div className="py-2 text-white flex flex-col gap-4">
                  <p className="text-xl font-semibold underline underline-offset-2 decoration-auto-red decoration-2">
                    Checklist:
                  </p>
                  <ul className="list-[square] pl-4">
                    {query.task?.checklist.map((c: any, i: any) => {
                      return <li key={i}>{c.text}</li>;
                    })}
                  </ul>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <>
          <h1 className="font-primary text-white font-bold text-4xl">
            {query.status == 1 || query.status == 3 ? "Resolved " : ""}Query:{" "}
            {query.subject}
          </h1>
          <hr className="w-20 border-3 border-auto-red my-6" />

          {loading ? (
            <div className="text-white">Loading...</div>
          ) : (
            <>
              <div className="flex flex-col">
                <input
                  type="text"
                  readOnly
                  className="w-1/2"
                  value={query.project_name}
                />
                <div className="ml-4 h-3 w-[2px] bg-[#252525]"></div>
                <textarea
                  className="w-1/2 h-32"
                  readOnly
                  value={query.description}
                ></textarea>
              </div>

              {query.status == 1 || query.status == 3 ? (
                <div className="flex flex-col gap-3 pt-6">
                  <big className="font-bold text-white">Remark:</big>
                  <textarea
                    className="w-1/2"
                    readOnly
                    value={query.remark}
                  ></textarea>
                </div>
              ) : (
                <>
                  <div className="ml-4 h-7 w-[2px] bg-[#252525]"></div>
                  <form className="flex flex-col w-1/2" onSubmit={resolveQuery}>
                    <textarea name="remark" placeholder="Remark..."></textarea>
                    <div className="flex justify-between lg:flex-row flex-col gap-4 w-full items-end mt-4">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setTransfer(true);
                        }}
                        className="cancelButton"
                      >
                        Transfer Query
                      </button>
                      {query.status == 2 && (
                        <span className="cancelButton cursor-auto">
                          {" "}
                          Task Created{" "}
                        </span>
                      )}
                      {query.status == 0 && (
                        <button
                          className="cancelButton"
                          onClick={handleTaskCreate}
                        >
                          Create Task for Query
                        </button>
                      )}
                      <input type="submit" value="Resolve Query" />
                    </div>
                  </form>
                  {transfer && (
                    <form
                      className="flex gap-4 w-1/2 mt-4"
                      onSubmit={handleTransfer}
                    >
                      <select name="transfer">
                        <option value="none">Select Resource</option>
                        {resources.map((r: any, i: any) => {
                          if (r.id == res_id) return;
                          return (
                            <option key={i} value={r.id}>
                              {r.name}
                            </option>
                          );
                        })}
                      </select>
                      <input type="submit" value="Transfer" />
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
