"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const api = process.env.NEXT_PUBLIC_APILINK;

type Props = {
  accessToken: string;
  p_id: string;
};

export default function Home({ accessToken, p_id }: Props) {
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

  const [process, setProcess] = useState({
    _id: "",
    name: "",
    process: [],
  });
  const [counter, setCounter] = useState(0);

  const [process_name, setProcess_name] = useState("");

  const [parentTsk, setParent] = useState(0);

  const [milestoneTags, setMilestoneTags] = useState([""]);

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
        setProcess(data.result);
        setTasks(data.result["process"]);
        setProcess_name(data.result["name"]);
        setMilestoneTags(data.result["milestones"]);
        // console.log(data.result);
        setLoading(false);
      }
    };
    getProcess(p_id);
  }, [p_id]);

  const [editingTaskID, seteditingTaskID] = useState(0);

  const [editing, setEditing] = useState(0);

  const [submit, setSubmit] = useState("Submit");

  const [editingT_name, setEditingT_name] = useState("");
  const [editingT_dept, setEditingT_dept] = useState("");
  const [editingT_time, setEditingT_time] = useState("");
  const [editingT_milestone, setEditingT_milestone] = useState(false);
  const [editingT_milestone_tag, setEditingT_milestone_tag] = useState("");
  const [editingT_milestone_tag_n, setEditingT_milestone_tag_n] = useState("");
  const [editingT_milestone_tag_input, setEditingT_milestone_tag_input] =
    useState(true);
  const [editingChecklist, setEditingChecklist] = useState([{ text: "" }]);

  const [between, setBetween] = useState(false);
  const [before, setBefore] = useState(false);
  const [childTsk, setChild] = useState(0);

  const [creatingT_name, setCreatingT_name] = useState("");
  const [creatingT_dept, setCreatingT_dept] = useState("");
  const [creatingT_time, setCreatingT_time] = useState("");
  const [creatingT_milestone, setCreatingT_milestone] = useState(false);
  const [creatingT_milestone_tag, setCreatingT_milestone_tag] = useState("");
  const [creatingT_milestone_tag_n, setCreatingT_milestone_tag_n] =
    useState("");
  const [creatingT_milestone_tag_input, setCreatingT_milestone_tag_input] =
    useState(true);

  const openTasksModal = (tsk: number, action: String) => {
    // console.log(edit)
    if (action == "edit") {
      setEditing(1);
      setTaskModal(!taskModalOpen);
      seteditingTaskID(tsk);
      // console.log(tasks[tsk])
      setEditingT_name(tasks[tsk]["name"]);
      setEditingT_dept(tasks[tsk]["dept"]);
      setEditingT_time(time_display(tasks[tsk]["time_req"]));
      setEditingT_milestone(tasks[tsk]["milestone"]);
      setEditingT_milestone_tag(tasks[tsk]["milestone_tag"]);
      setEditingT_milestone_tag_n("");
      setEditingT_milestone_tag_input(true);
      setEditingChecklist(tasks[tsk]["checklist"]);
    } else {
      setEditing(0);
      setTaskModal(!taskModalOpen);
      setCreatingT_name("");
      setCreatingT_dept("");
      setCreatingT_time("");
      setCreatingT_milestone(false);
      setCreatingT_milestone_tag("");
      setCreatingT_milestone_tag_n("");
      if (action == "add to end") {
        setParent(tsk);
      } else if (action == "add between") {
        setParent(tsk);
        setBetween(true);
      } else if (action == "add before") {
        setBefore(true);
        setChild(tsk);
        let b_tasks = [...tasks];
        b_tasks.map((t: any, i: number) => {
          if (t["next"].includes(tsk)) {
            setParent(t["task_id"]);
          }
        });
      }
    }
  };

  const time_convert = (time: string) => {
    if (time.split(":").length != 3) {
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

  useEffect(() => {
    if (creatingT_milestone_tag == "new") {
      setCreatingT_milestone_tag_input(false);
    }
  }, [creatingT_milestone_tag]);

  useEffect(() => {
    if (editingT_milestone_tag == "new") {
      setEditingT_milestone_tag_input(false);
    }
  }, [editingT_milestone_tag]);

  const time_display = (duration: number) => {
    var seconds = Math.floor((duration / 1000) % 60);
    var minutes = Math.floor((duration / (1000 * 60)) % 60);
    var hours = Math.floor(duration / (1000 * 60 * 60));

    var hours_d = hours < 10 ? "0" + hours : hours;
    var minutes_d = minutes < 10 ? "0" + minutes : minutes;
    var seconds_d = seconds < 10 ? "0" + seconds : seconds;

    return hours_d + ":" + minutes_d + ":" + seconds_d;
  };

  const taskCreate = (e: any) => {
    e.preventDefault();
    if (
      creatingT_milestone &&
      (creatingT_milestone_tag == "" || creatingT_milestone_tag == "none")
    ) {
      alert("Please select a milestone tag or create a new one");
      return;
    } else if (
      creatingT_milestone &&
      creatingT_milestone_tag == "new" &&
      creatingT_milestone_tag_n == ""
    ) {
      alert("Please enter a milestone tag name");
      return;
    }
    let milestones = [...milestoneTags];
    const t_name = e.target.task_name.value;
    const t_dept = e.target.department.value;
    const t_time = time_convert(e.target.time_req.value);
    const t_tag =
      creatingT_milestone_tag == "new"
        ? creatingT_milestone_tag_n
        : creatingT_milestone_tag;
    const checklist: any = [];
    Array.from(Array(counter)).map((c, i) => {
      checklist.push({ text: e.target[`item_${i}`].value });
    });
    const task = {
      task_id: tasks.length,
      name: t_name,
      dept: t_dept,
      time_req: Number(t_time),
      checklist: checklist,
      next: [],
      milestone: creatingT_milestone,
      milestone_tag: t_tag,
    };
    // console.log(task)
    const updatedTasks: any = tasks;
    if (creatingT_milestone_tag == "new") {
      milestones.push(creatingT_milestone_tag_n);
      setMilestoneTags(milestones);
    }
    if (tasks.length == 1) {
      updatedTasks.push(task);
      updatedTasks[0]["next"].push(1);
      setTasks(updatedTasks);
    } else if (parentTsk !== 0) {
      if (between) {
        let indexforTask = updatedTasks.length;
        let next = updatedTasks[parentTsk]["next"];
        updatedTasks.map((t: any, i: number) => {
          if (t["task_id"] === parentTsk) {
            updatedTasks[i]["next"] = [indexforTask];
            updatedTasks.push(task);
            updatedTasks[indexforTask]["next"] = next;
            setTasks(updatedTasks);
          }
        });
      } else if (before) {
        let indexforTask = updatedTasks.length;
        // let next = updatedTasks[childTsk]['next'];
        updatedTasks.map((t: any, i: number) => {
          if (t["task_id"] === parentTsk) {
            updatedTasks[i]["next"] = updatedTasks[i]["next"].filter(
              (n: number) => n != childTsk,
            );
            updatedTasks[i]["next"].push(indexforTask);
            updatedTasks.push(task);
            updatedTasks[indexforTask]["next"] = [childTsk];
            setTasks(updatedTasks);
            // console.log(updatedTasks);
          }
        });
      } else {
        let indexforTask = updatedTasks.length;
        updatedTasks.map((t: any, i: number) => {
          if (t["task_id"] === parentTsk) {
            updatedTasks[i]["next"].push(indexforTask);
            updatedTasks.push(task);
            // console.log(updatedTasks)
            setTasks(updatedTasks);
          }
        });
      }
    } else if (parentTsk === 0 && tasks.length > 1) {
      console.log("parent 0");
      let indexforTask = updatedTasks.length;
      let next = updatedTasks[0]["next"];
      updatedTasks[0]["next"] = [indexforTask];
      updatedTasks.push(task);
      updatedTasks[indexforTask]["next"] = next;
      setTasks(updatedTasks);
      // console.log(updatedTasks);
    } else {
      let indexforTask = updatedTasks.length;
      updatedTasks[updatedTasks.length - 1]["next"].push(indexforTask);
      updatedTasks.push(task);
      setTasks(updatedTasks);
    }
    e.target.reset();
    setParent(0);
    setCounter(0);
    setTaskModal(false);
    setBetween(false);
    setBefore(false);
    setChild(0);
    // console.log(tasks);
  };

  const taskEdit = (tsk: number, e: any) => {
    e.preventDefault();
    if (
      editingT_milestone &&
      (editingT_milestone_tag == "" || editingT_milestone_tag == "none")
    ) {
      alert("Please select a milestone tag or create a new one");
      return;
    } else if (
      editingT_milestone &&
      editingT_milestone_tag == "new" &&
      editingT_milestone_tag_n == ""
    ) {
      alert("Please enter a milestone tag name");
      return;
    }
    let milestones = [...milestoneTags];
    const t_name = e.target.e_task_name.value;
    const t_dept = e.target.e_department.value;
    const t_time = time_convert(e.target.e_time_req.value);
    const t_tag =
      editingT_milestone_tag == "new"
        ? editingT_milestone_tag_n
        : editingT_milestone_tag;
    const checklist: any = [];
    editingChecklist.map((c, i) => {
      checklist.push({ text: c.text });
    });
    if (editingT_milestone_tag == "new") {
      milestones.push(editingT_milestone_tag_n);
      setMilestoneTags(milestones);
    }
    Array.from(Array(counter)).map((c, i) => {
      checklist.push({ text: e.target[`e_item_${i}`].value });
    });
    const task = {
      task_id: tsk,
      name: t_name,
      dept: t_dept,
      time_req: Number(t_time),
      checklist: checklist,
      next: tasks[tsk]["next"],
      milestone: editingT_milestone,
      milestone_tag: t_tag,
    };
    // console.log(task)
    const updatedTasks: any = tasks;
    updatedTasks.map((t: any, i: number) => {
      if (t["task_id"] === tsk) {
        updatedTasks[i] = task;
        setTasks(updatedTasks);
      }
    });
    e.target.reset();
    setParent(0);
    setCounter(0);
    setEditing(0);
    setEditingT_name("");
    setEditingT_dept("");
    setEditingT_time("");
    setEditingChecklist([{ text: "" }]);
    setEditingT_milestone(false);
    setEditingT_milestone_tag("");
    setEditingT_milestone_tag_n("");
    setEditingT_milestone_tag_input(true);
    seteditingTaskID(0);
    setTaskModal(false);

    // console.log(tasks);
  };

  const addInput = () => {
    setCounter(counter + 1);
    //   console.log(counter);
  };

  const deleteTask = (i: number) => {
    var newProcess = [...tasks];
    newProcess.map((t: any, j: number) => {
      t.next.map((x: number) => {
        if (x == i) {
          t.next = t.next.filter((n: number) => n != i);
          t.next.push(...newProcess[i].next);
        }
      });
    });
    newProcess[i] = {
      task_id: newProcess[i].task_id,
      name: "",
      dept: "",
      time_req: 0,
      checklist: [{ text: "" }],
      next: [],
      milestone: false,
      milestone_tag: "",
    };
    // console.log("delete", newProcess)
    setTasks(newProcess);
    // console.log(tasks);
  };

  const [departments, setDepartments] = useState([]);

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
      .then((data) => setDepartments(data.result));
  }, []);

  const depts = departments.map((dept, i) => {
    return (
      <option value={dept["name"]} key={i}>
        {dept["name"]}
      </option>
    );
  });

  const sendProcess = async (e: any) => {
    e.preventDefault();
    setSubmit("Submitting...");
    const p_name = process_name;
    const p_tasks = tasks;
    fetch(`${api}/admin/project/template/update`, {
      body: JSON.stringify({
        id: process["_id"],
        name: p_name,
        process: p_tasks,
        milestones: milestoneTags,
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
        //   console.log(data);
        if (data.status === "success") {
          location.replace("/admin/process");
        }
      });
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
      ) : node.next.length ? (
        <div className="flex flex-col items-start">
          <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
          <input
            type="button"
            value="+"
            onClick={() => openTasksModal(node.task_id, "add before")}
          />
          <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
          <div className="flex flex-row items-center">
            <p
              className="text-white h-min px-6 py-3 border-3 border-[#343434]/70 bg-black outline-none transition duration-300 w-52 rounded-md text-sm"
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
                  icon={faEdit as IconProp}
                  className="cursor-pointer"
                  onClick={() => {
                    openTasksModal(node.task_id, "edit");
                  }}
                />
                {node.task_id == 1 ? (
                  ""
                ) : (
                  <FontAwesomeIcon
                    icon={faTrash as IconProp}
                    className="cursor-pointer pl-2"
                    onClick={() => {
                      deleteTask(node.task_id);
                    }}
                  />
                )}
              </span>
            </p>
            <div className="bg-[#252525] w-4 h-[2px]"></div>
            <input
              type="button"
              value="+"
              onClick={() => openTasksModal(node.task_id, "add to end")}
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start">
          <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
          <input
            type="button"
            value="+"
            onClick={() => openTasksModal(node.task_id, "add before")}
          />
          <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
          <div className="flex flex-row items-center">
            <p
              className="text-white h-min px-6 py-3 border-3 border-[#343434]/70 bg-black outline-none transition duration-300 w-52 rounded-md text-sm"
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
                  icon={faEdit as IconProp}
                  className="cursor-pointer"
                  onClick={() => {
                    openTasksModal(node.task_id, "edit");
                  }}
                />
                {node.task_id == 1 ? (
                  ""
                ) : (
                  <FontAwesomeIcon
                    icon={faTrash as IconProp}
                    className="cursor-pointer pl-2"
                    onClick={() => {
                      deleteTask(node.task_id);
                    }}
                  />
                )}
              </span>
            </p>
            <div className="bg-[#252525] w-4 h-[2px]"></div>
            <input
              type="button"
              value="+"
              className="mr-4"
              onClick={() => openTasksModal(node.task_id, "add to end")}
            />
          </div>
          <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
          <input
            type="button"
            value="+"
            onClick={() => openTasksModal(node.task_id, "add to end")}
          />
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
                    <input
                      type="button"
                      value="+"
                      onClick={() =>
                        openTasksModal(node.task_id, "add between")
                      }
                    />
                    <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
                    <div className={`bg-[#252525] w-full h-[2px] ml-4`}></div>
                  </>
                ) : (
                  <>
                    <div className="bg-transparent w-[2px] h-16 ml-4"></div>
                    <div className={`bg-[#252525] w-full h-[2px]`}></div>
                  </>
                )
              ) : i == 0 ? (
                ""
              ) : (
                <>
                  <div className="bg-transparent w-[2px] h-16 ml-4"></div>
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

  const deleteItem = (i: number) => {
    setEditingChecklist([
      ...editingChecklist.filter((c, index) => index !== i),
    ]);
  };

  const cancelButton = (e: any) => {
    e.preventDefault();
    if (editing > 0) {
      setEditing(0);
      setEditingT_name("");
      setEditingT_dept("");
      setEditingT_time("");
      setEditingChecklist([{ text: "" }]);
      seteditingTaskID(0);
      setTaskModal(false);
    } else {
      setCreatingT_name("");
      setCreatingT_dept("");
      setCreatingT_time("");
      setBetween(false);
      setBefore(false);
      setChild(0);
      setParent(0);
      setTaskModal(false);
    }
  };

  useEffect(() => {
    if (creatingT_milestone == false) {
      setCreatingT_milestone_tag_input(true);
      setCreatingT_milestone_tag("");
    }
  }, [creatingT_milestone]);

  return (
    <>
      <Navbar username={b.company} avatarUrl={avatar} />

      <h1 className="font-primary text-white font-bold text-4xl">
        Process Editing
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
              <h1 className="font-primary text-white font-bold text-4xl">
                Task {editing ? "Editing" : "Creation"}
              </h1>
              <hr className="w-20 border-3 border-auto-red my-6" />
              {editing > 0 ? (
                <form
                  className="grid md:grid-cols-2 gap-10"
                  onSubmit={(e) => {
                    taskEdit(editingTaskID, e);
                  }}
                >
                  <div className="flex flex-col gap-6">
                    <input
                      type="text"
                      name="e_task_name"
                      placeholder="Task Name"
                      value={editingT_name}
                      onChange={(e) => setEditingT_name(e.target.value)}
                      required
                    />
                    <select
                      name="e_department"
                      value={editingT_dept}
                      onChange={(e) => setEditingT_dept(e.target.value)}
                    >
                      <option value="none" className="text-white/20">
                        Department
                      </option>
                      {depts}
                    </select>
                    <input
                      type="text"
                      name="e_time_req"
                      placeholder="Time Required (HH:MM:SS)"
                      value={editingT_time}
                      onChange={(e) => setEditingT_time(e.target.value)}
                      required
                    />
                    {/* <p>{editingTaskID}</p> */}
                    <div className="flex gap-3 items-center">
                      <input
                        type="checkbox"
                        name="milestone"
                        id="milestoneCheckbox"
                        checked={editingT_milestone}
                        onChange={() => {
                          if (editingT_milestone) {
                            setEditingT_milestone_tag("");
                          }
                          setEditingT_milestone(!editingT_milestone);
                        }}
                      />
                      <label htmlFor="milestoneCheckbox" className="text-white">
                        Milestone
                      </label>
                      <select
                        name="milestone_tag"
                        id="milestoneSelect"
                        hidden={
                          !editingT_milestone || !editingT_milestone_tag_input
                        }
                        className="w-96"
                        value={editingT_milestone_tag}
                        onChange={(e) =>
                          setEditingT_milestone_tag(e.target.value)
                        }
                      >
                        <option value="none">Milestone Tag</option>
                        {milestoneTags.map((tag, i) => {
                          if (tag === "") {
                            return "";
                          }
                          return (
                            <option value={tag} key={i}>
                              {tag}
                            </option>
                          );
                        })}
                        <option value="new">+ Create New Tag</option>
                      </select>
                      <input
                        type="text"
                        name="milestone_tag"
                        value={editingT_milestone_tag_n}
                        hidden={
                          editingT_milestone_tag_input || !editingT_milestone
                        }
                        className="w-96"
                        onChange={(e) =>
                          setEditingT_milestone_tag_n(e.target.value)
                        }
                        placeholder="New Milestone Tag"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-6">
                    <h3 className="font-primary text-white font-bold text-2xl">
                      Checklist Creation
                    </h3>
                    <div className="border-l-3 border-white/60 max-w-md pl-4 grid gap-4 max-h-80 overflow-y-scroll scrollbar-thin scrollbar-track-[#0a0a0a] scrollbar-thumb-white/20">
                      {editingChecklist.map((c, i) => {
                        return (
                          <div className="flex items-center gap-4" key={i}>
                            <input
                              type="text"
                              name={`e_editing_item_${i}`}
                              placeholder="Item Name"
                              required
                              className="w-96"
                              value={c.text}
                              onChange={(e) => {
                                editingChecklist[i].text = e.target.value;
                                setEditingChecklist([...editingChecklist]);
                              }}
                            />
                            <FontAwesomeIcon
                              icon={faTrash as IconProp}
                              className="text-white cursor-pointer"
                              onClick={() => {
                                deleteItem(i);
                              }}
                            />
                          </div>
                        );
                      })}
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
                      <input type="button" value="+" onClick={addInput} />
                    </div>
                  </div>
                  <div className="space-x-2">
                    <input type="submit" />
                    <button onClick={cancelButton} className="cancelButton">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <form
                  className="grid md:grid-cols-2 gap-10"
                  onSubmit={taskCreate}
                >
                  <div className="flex flex-col gap-6">
                    <input
                      type="text"
                      name="task_name"
                      placeholder="Task Name"
                      required
                      value={creatingT_name}
                      onChange={(e) => setCreatingT_name(e.target.value)}
                    />
                    <select
                      name="department"
                      value={creatingT_dept}
                      required
                      onChange={(e) => setCreatingT_dept(e.target.value)}
                    >
                      <option value="none" className="text-white/20">
                        Departments
                      </option>
                      {depts}
                    </select>
                    <input
                      type="text"
                      name="time_req"
                      placeholder="Time Required (HH:MM:SS)"
                      value={creatingT_time}
                      onChange={(e) => setCreatingT_time(e.target.value)}
                    />
                    <div className="flex gap-3 items-center">
                      <input
                        type="checkbox"
                        name="milestone"
                        id="milestoneCheckbox"
                        checked={creatingT_milestone}
                        onChange={() =>
                          setCreatingT_milestone(!creatingT_milestone)
                        }
                      />
                      <label htmlFor="milestoneCheckbox" className="text-white">
                        Milestone
                      </label>
                      <select
                        name="milestone_tag"
                        id="milestoneSelect"
                        hidden={
                          !creatingT_milestone || !creatingT_milestone_tag_input
                        }
                        className="w-96"
                        value={creatingT_milestone_tag}
                        onChange={(e) =>
                          setCreatingT_milestone_tag(e.target.value)
                        }
                      >
                        <option value="none">Milestone Tag</option>
                        {milestoneTags.map((tag, i) => {
                          if (tag === "") {
                            return "";
                          }
                          return (
                            <option value={tag} key={i}>
                              {tag}
                            </option>
                          );
                        })}
                        <option value="new">+ Create New Tag</option>
                      </select>
                      <input
                        type="text"
                        name="milestone_tag"
                        value={creatingT_milestone_tag_n}
                        hidden={
                          creatingT_milestone_tag_input || !creatingT_milestone
                        }
                        className="w-96"
                        onChange={(e) =>
                          setCreatingT_milestone_tag_n(e.target.value)
                        }
                        placeholder="New Milestone Tag"
                      />
                    </div>
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
                              name={`item_${i}`}
                              required
                              placeholder="Item Name"
                              className="w-96"
                            />
                          </div>
                        );
                      })}
                      <input type="button" value="+" onClick={addInput} />
                    </div>
                  </div>
                  <div className="space-x-2">
                    <input type="submit" />
                    <button onClick={cancelButton} className="cancelButton">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          <form
            className="flex flex-col gap-6 items-center"
            onSubmit={sendProcess}
          >
            <input
              type="text"
              name="process_name"
              required
              className="w-1/3 text-white"
              placeholder="Process Name"
              value={process_name}
              onChange={(e) => setProcess_name(e.target.value)}
            />

            <div className="relative w-11/12">
              <h3 className="font-primary text-white font-bold text-2xl">
                Task Creation
              </h3>

              <div className="flex items-start flex-col overflow-x-scroll scrollbar-thin scrollbar-track-[#0a0a0a] scrollbar-thumb-white/20 py-4">
                {tasks.length > 1 ? (
                  <TreeView nodes={[0]} allNodes={tasks} />
                ) : (
                  <input
                    type="button"
                    value="+"
                    onClick={() => openTasksModal(0, "add to end")}
                  />
                )}
              </div>
              <div className="absolute right-0 top-0 w-1/3 space-y-4">
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
                        <FontAwesomeIcon
                          icon={faTrash as IconProp}
                          className="cursor-pointer"
                          onClick={() => {
                            if (
                              tasks.filter((task) => task.milestone_tag === tag)
                                .length > 0
                            ) {
                              alert(
                                "Cannot delete milestone with tasks associated",
                              );
                            } else {
                              setMilestoneTags(
                                milestoneTags.filter((t) => t !== tag),
                              );
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="buttonBox">
              <input type="submit" value={submit} />
              <button
                onClick={(e) => {
                  e.preventDefault;
                  location.replace("/admin/process");
                }}
                className="cancelButton"
              >
                Cancel
              </button>
            </div>
          </form>
        </>
      )}
    </>
  );
}
