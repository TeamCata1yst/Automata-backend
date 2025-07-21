"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDoubleRight, faUndo } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const api = process.env.NEXT_PUBLIC_APILINK;

type Props = {
  accessToken: string;
  t_id: string;
};

export default function Home({ accessToken, t_id }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
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
  const day = new Date(t_id.split("_")[0].replaceAll("%3A", ":"));
  day.setHours(day.getHours() - 5, day.getMinutes() - 30);
  day.setHours(0, 0, 0, 0);
  const project = t_id.split("_")[1];
  const task = t_id.split("_")[2];

  if (t_id.split("_").length != 3) {
    location.replace("/resource/");
  }

  const [days, setDays] = useState([{ date: "", tasks: [] }]);

  const [remark, setRemark] = useState(false);

  const [task_r, setTask_r] = useState({
    checklist: [],
    project_id: 0,
    remark: "",
    task_id: 0,
    project_name: "",
    name: "",
    deadline: "",
    status: 0,
    time_req: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${api}/user/project/`, {
          headers: {
            "Content-Type": "application/json",
            Token: accessToken,
          },
          method: "GET",
        });
        const data = await res.json();
        setDays(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
    setInterval(fetchData, 60000);
  }, []);

  // useEffect(() => {
  //     console.log(day);
  // }, [day]);

  useEffect(() => {
    setTask_r(
      days
        .filter((d: any) => {
          let d_date;
          d_date = new Date(d.date);
          d_date.setHours(0, 0, 0, 0);
          // console.log(d_date, day);
          return d_date.getTime() == day.getTime();
        })[0]
        ?.tasks.filter(
          (t: any) => t.project_id == project && t.task_id == task,
        )[0],
    );
    // console.log(days, project, task, task_r);
    setLoading(false);
  }, [days]);

  const t_n = new Date();

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
    let task_remark = "";
    if (e.target.task_status.value == "none") task_status = 0;
    if (e.target.task_status.value == "1") {
      if (Date.parse(task_r.deadline) < Date.parse(t_n.toString())) {
        task_status = 2;
      } else task_status = 1;
    }
    if (e.target.task_status.value == "4") task_status = 4;
    if (e.target.task_status.value == "-1") {
      task_status = -1;
      task_remark = e.target.remark?.value;
    }
    const task_id = Number(task);
    const project_id = project;
    try {
      fetch(`${api}/user/project/task/`, {
        body: JSON.stringify({
          task_id: task_id,
          project_id: project_id,
          status: task_status,
          remark: task_remark,
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

  const sendIncompleteStatus = async () => {
    const task_id = Number(task);
    const project_id = project;
    try {
      fetch(`${api}/user/project/task/`, {
        body: JSON.stringify({
          task_id: task_id,
          project_id: project_id,
          status: -1,
          remark: "Marked incomplete after completion.",
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

  // useEffect(() => { console.log(task_r) }, [task_r]);

  return (
    <>
      <Navbar
        instance="resource-query"
        username={b.company}
        avatarUrl={avatar}
      />

      <h1 className="font-primary text-white font-bold text-4xl flex items-center gap-3">
        {task_r?.project_name}{" "}
        <FontAwesomeIcon
          icon={faAngleDoubleRight as IconProp}
          className="h-6"
        />{" "}
        {task_r?.name}
      </h1>
      <hr className="w-20 border-3 border-auto-red my-6" />
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="py-2 text-white flex flex-col gap-4">
              <p className="">
                <span className="font-semibold underline underline-offset-2 decoration-auto-red decoration-2">
                  Deadline:
                </span>{" "}
                {`${new Date(task_r?.deadline).getDate()}-${
                  new Date(task_r?.deadline).getMonth() + 1
                }-${new Date(task_r?.deadline).getFullYear()}`}
              </p>
              {task_r?.status == 1 || task_r?.status == 2 ? (
                // task complete
                <>
                  <p className="font-semibold">Task Completed</p>
                  <p className="cancelButton" onClick={sendIncompleteStatus}>
                    <FontAwesomeIcon icon={faUndo as IconProp} /> Mark as
                    Incomplete
                  </p>
                </>
              ) : // task not complete
              task_r?.status == -1 ? (
                <>
                  <p className="font-semibold text-auto-red">
                    Task Not Completed
                  </p>
                  <p>
                    <span className="font-semibold">Your Remark: </span>
                    {task_r.remark}
                  </p>
                  <form onSubmit={sendTaskStatus}>
                    <select className="w-64" name="task_status">
                      <option value="-1">Not Completed</option>
                      <option value="1">Completed</option>
                    </select>
                    <input
                      type="submit"
                      value="Update Task"
                      className="mx-4 w-max"
                    />
                  </form>
                </>
              ) : task_r?.status == 4 ? (
                // task started
                <>
                  <p>
                    <span className="font-semibold underline underline-offset-2 decoration-auto-red decoration-2">
                      Time Required for Task:
                    </span>{" "}
                    {time_display(task_r?.time_req)}
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
                      <option value="4">Started</option>
                      <option value="1">Completed</option>
                      <option value="-1">Not Completed</option>
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
                // task not started
                <>
                  <p>
                    <span className="font-semibold underline underline-offset-2 decoration-auto-red decoration-2">
                      Time Required for Task:
                    </span>{" "}
                    {time_display(task_r?.time_req)}
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
                      <option value="-1">Not Completed</option>
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
                {task_r?.checklist.map((c: any, i: any) => {
                  return <li key={i}>{c.text}</li>;
                })}
              </ul>
            </div>
          </div>
        </>
      )}
    </>
  );
}
