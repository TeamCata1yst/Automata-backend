"use client";
import { useState, useEffect, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faClose } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";

const api = process.env.APILINK;

type Props = {
  accessToken: string;
  p_id: string;
};

export default function Home({ accessToken, p_id }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const [loading, setLoading] = useState(true);
  const [process_name, setProcess_name] = useState("");

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
  interface stringObject {
    text: string;
  }

  const [tasks, setTasks] = useState([
    {
      task_id: 0,
      name: "",
      dept: "",
      time_req: 0,
      checklist: [{ text: "" }],
      next: [],
      milestone: false,
      milestone_tag: "",
    },
  ]);
  const [taskModalOpen, setTaskModal] = useState(false);

  const [milestoneTags, setMilestoneTags] = useState([""]);

  useEffect(() => {
    const getProcess = async (pr: string) => {
      const res = await fetch(`${api}/admin/project/templates/${pr}`, {
        headers: {
          "Content-Type": "application/json",
          Token: accessToken,
        },
        method: "GET",
      });
      const data = await res.json();
      if (data.status === "unauthorized") {
        const res_l = await fetch("/api/logout");
        const data_l = await res_l.json();
        if (data_l.status === "200") {
          location.replace("/admin/login");
        }
      } else if (data.status !== "success") {
        location.replace("/admin/process");
      } else {
        setTasks(data.result["process"]);
        setProcess_name(data.result["name"]);
        setMilestoneTags(data.result["milestones"]);
        // console.log(data.result);
        setLoading(false);
      }
    };
    getProcess(p_id);
  }, [p_id]);

  useEffect(() => {
    console.log(tasks);
  }, [tasks]);

  const [viewingT_name, setViewingT_name] = useState("");
  const [viewingT_dept, setViewingT_dept] = useState("");
  const [viewingT_time, setViewingT_time] = useState("");
  const [viewingChecklist, setViewingChecklist] = useState([{ text: "" }]);
  const [viewingT_milestone, setViewingT_milestone] = useState(false);
  const [viewingT_milestone_tag, setViewingT_milestone_tag] = useState("");

  const openTasksModal = (tsk: number) => {
    setTaskModal(!taskModalOpen);
    setViewingT_name(tasks[tsk]["name"]);
    setViewingT_dept(tasks[tsk]["dept"]);
    setViewingT_time(time_display(tasks[tsk]["time_req"]));
    setViewingChecklist(tasks[tsk]["checklist"]);
    setViewingT_milestone(tasks[tsk]["milestone"]);
    setViewingT_milestone_tag(tasks[tsk]["milestone_tag"]);
  };

  const time_display = (duration: number) => {
    var seconds = Math.floor((duration / 1000) % 60);
    var minutes = Math.floor((duration / (1000 * 60)) % 60);
    var hours = Math.floor(duration / (1000 * 60 * 60));

    var hours_d = hours < 10 ? "0" + hours : hours;
    var minutes_d = minutes < 10 ? "0" + minutes : minutes;
    var seconds_d = seconds < 10 ? "0" + seconds : seconds;

    return hours_d + ":" + minutes_d + ":" + seconds_d;
  };

  interface Node {
    task_id: number;
    name: string;
    dept: string;
    checklist: stringObject[];
    time_req: number;
    next: number[];
    milestone: boolean;
    milestone_tag: string;
  }

  const TreeNode: React.FC<{ node: Node; allNodes: Node[]; level: number }> = ({
    node,
    allNodes,
    level,
  }) => (
    <div className="flex flex-col items-start">
      {node.name === "" ? (
        <div className="bg-[#252525] h-3 w-3 ml-2.5 rounded-full"></div>
      ) : (
        <div className="flex flex-col items-start">
          <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
          <div className="flex flex-row items-center">
            <p
              className="text-white h-min mr-4 px-6 py-3 border-3 border-[#343434]/70 bg-black outline-none transition duration-300 w-52 rounded-md text-sm"
              style={
                node.milestone ? { background: "rgba(255,255,255,0.1)" } : {}
              }
            >
              {node.milestone ? (
                <>
                  <small className="text-white opacity-80">
                    Milestone - {node.milestone_tag}
                  </small>
                  <br />
                </>
              ) : (
                ""
              )}
              {node.name}
              <br />
              <small className="text-white opacity-80">{node.dept}</small>
              <br />
              <span>
                <FontAwesomeIcon
                  icon={faEye as IconProp}
                  className="cursor-pointer"
                  onClick={() => {
                    openTasksModal(node.task_id);
                  }}
                />
              </span>
            </p>
          </div>
        </div>
      )}
      {node.next && (
        <div className="flex flex-row items-start">
          {node.next.map((nextIndex, i) => (
            <div key={nextIndex} className="flex flex-col items-start">
              {i !== node.next.length - 1 ? (
                i == 0 ? (
                  <>
                    <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
                    <div className={`bg-[#252525] w-full h-[2px] ml-4`}></div>
                  </>
                ) : (
                  <>
                    <div className="bg-transparent w-[2px] h-4 ml-4"></div>
                    <div className={`bg-[#252525] w-full h-[2px]`}></div>
                  </>
                )
              ) : i == 0 ? (
                ""
              ) : (
                <>
                  <div className="bg-transparent w-[2px] h-4 ml-4"></div>
                  <div className={`bg-[#252525] w-8 h-[2px] -ml-4`}></div>
                </>
              )}
              <TreeNode
                node={allNodes[nextIndex]}
                allNodes={allNodes}
                level={level}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const TreeView: React.FC<{ nodes: number[]; allNodes: Node[] }> = ({
    nodes,
    allNodes,
  }) => (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "start" }}
    >
      {nodes.map((nodeIndex) => (
        <TreeNode
          key={nodeIndex}
          node={allNodes[nodeIndex]}
          allNodes={allNodes}
          level={0}
        />
      ))}
    </div>
  );

  return (
    <>
      <Navbar username={b.company} avatarUrl={avatar} />

      <h1 className="font-primary text-white font-bold text-4xl">
        Process View
      </h1>
      <hr className="w-20 border-3 border-auto-red my-6" />
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <div
            className={`fixed bg-black/50 backdrop-blur-[2px] inset-0 z-40 justify-center items-center flex transition duration-500 ${
              taskModalOpen ? "translate-y-0" : "-translate-y-full"
            }`}
          >
            <div className="bg-[#0a0a0a] rounded-lg p-8 absolute w-4/5 z-50">
              <FontAwesomeIcon
                icon={faClose as IconProp}
                inverse
                className="cursor-pointer absolute right-8 top-8 h-5"
                onClick={() => {
                  setTaskModal(false);
                }}
              />
              <h1 className="font-primary text-white font-bold text-4xl">
                Task View
              </h1>
              <hr className="w-20 border-3 border-auto-red my-6" />
              <form className="grid md:grid-cols-2 gap-10">
                <div className="flex flex-col gap-6">
                  <input type="text" value={viewingT_name} readOnly />
                  <input type="text" value={viewingT_dept} readOnly />
                  <input type="text" value={viewingT_time} readOnly />
                  <div className="flex gap-3 items-center">
                    <input
                      type="checkbox"
                      name="milestone"
                      id="milestoneCheckbox"
                      checked={viewingT_milestone}
                      readOnly
                    />
                    <label htmlFor="milestoneCheckbox" className="text-white">
                      Milestone
                    </label>
                    <input
                      type="text"
                      value={viewingT_milestone_tag}
                      hidden={!viewingT_milestone}
                      readOnly
                      className="w-96"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-6">
                  <h3 className="font-primary text-white font-bold text-2xl">
                    Checklist View
                  </h3>
                  <div className="border-l-3 border-white/60 max-w-md pl-4 grid gap-4 max-h-80 overflow-y-scroll scrollbar-thin scrollbar-track-[#0a0a0a] scrollbar-thumb-white/20">
                    {viewingChecklist.map((c, i) => {
                      return (
                        <div className="flex items-center gap-4" key={i}>
                          <input
                            type="text"
                            className="w-96"
                            value={c.text}
                            readOnly
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </form>
            </div>
          </div>

          <form className="flex flex-col gap-6 items-center">
            <input
              type="text"
              className="w-1/3 text-white"
              value={process_name}
              readOnly
            />

            <div className="relative w-11/12">
              <h3 className="font-primary text-white font-bold text-2xl">
                Tasks
              </h3>

              <div className="flex items-start flex-col overflow-x-scroll scrollbar-thin scrollbar-track-[#0a0a0a] scrollbar-thumb-white/20 py-4">
                {tasks.length > 1 ? (
                  <TreeView nodes={[0]} allNodes={tasks} />
                ) : (
                  "No tasks found."
                )}
              </div>
              <div className="absolute top-0 right-0 w-1/3 space-y-4">
                <h3 className="font-primary text-white font-bold text-2xl">
                  Milestones
                </h3>
                <div className="grid gap-4">
                  {milestoneTags.map((tag, i) => {
                    if (tag === "") {
                      return "";
                    }
                    return (
                      <div
                        className="flex justify-between items-center text-white bg-black px-6 py-3 border-3 border-[#343434]/70 rounded-md"
                        key={i}
                      >
                        <p>
                          {tag}{" "}
                          <span className="text-sm opacity-80">
                            {
                              tasks.filter((task) => task.milestone_tag === tag)
                                .length
                            }{" "}
                            tasks
                          </span>
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="buttonBox">
              <Link href="/admin/process" className="cancelButton">
                Go back to Processes
              </Link>
            </div>
          </form>
        </>
      )}
    </>
  );
}
