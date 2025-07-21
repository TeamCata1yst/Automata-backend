"use client";
import { use, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const api = process.env.NEXT_PUBLIC_APILINK;

type Props = {
  accessToken: string;
};

export default function Home({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const [workingHours, setWorkingHours] = useState(0);
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

  interface ResourcesObject {
    [key: string]: any;
  }

  const [processes, setProcesses] = useState([
    {
      name: "",
      process: [
        {
          task_id: 0,
          name: "",
          dept: "",
          time_req: 0,
          checklist: [],
          next: [],
          selected_resource: "",
          selected_resource_name: "",
        },
      ],
      time: 0,
      milestones: [],
    },
  ]);
  const [process_t, setProcess] = useState([
    {
      task_id: 0,
      name: "",
      dept: "",
      time_req: 0,
      checklist: [],
      next: [],
      selected_resource: "",
      selected_resource_name: "",
    },
  ]);
  const [processTime, setProcessTime] = useState(0);
  const [totalTime, setTotalTime] = useState("0");
  const [buffer, setbuffer] = useState(1);
  const [processName, setProcessName] = useState("");
  const [milestones, setMilestones] = useState([]);
  const [resources, setResources] = useState<ResourcesObject>({});

  useEffect(() => {
    fetch(`${api}/admin/project/templates`, {
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
        let sorted = data.sort((a: any, b: any) => {
          if (a.name.toLowerCase() < b.name.toLowerCase()) {
            return -1;
          } else if (a.name.toLowerCase() > b.name.toLowerCase()) {
            return 1;
          }
          return 0;
        });
        setProcesses(sorted);
        console.log(data);
      });
  }, []);

  useEffect(() => {
    if (processName == "none") {
      const emptyProcess = [
        {
          task_id: 0,
          name: "",
          dept: "",
          time_req: 0,
          checklist: [],
          next: [],
          selected_resource: "",
          selected_resource_name: "",
        },
      ];
      setProcess(emptyProcess);
      setProcessTime(0);
    } else {
      const index = Number(processName);
      setProcessTime(processes[index]["time"]);
      setMilestones(processes[index]["milestones"]);
      setProcess(processes[index]["process"]);
      setResources({});
      const fetchDepartments = async () => {
        var depts: String[] = [];
        const promises = processes[index]["process"].map((t: any) => {
          if (t.dept == "") return [];
          if (t.dept == "none") return [];
          if (depts.includes(t.dept)) {
            return [];
          } else {
            depts.push(t.dept);
            return fetch(`${api}/admin/user/${t.dept}`, {
              headers: {
                "Content-Type": "application/json",
                Token: accessToken,
              },
              method: "GET",
            })
              .then((res) => {
                if (res.ok) return res.json();
                else throw new Error("Error fetching resources");
              })
              .catch((error) => {
                console.error(error + ` for task ${t.name} dept ${t.dept}`);
                return [];
              });
          }
        });

        const departments = await Promise.all(promises);
        const a = departments.filter((t: any) => t.length != 0);
        const resourcesObject: any = {};

        depts.map((t: any, i: number) => {
          if (t == "") return;
          if (t == "none") return;
          resourcesObject[t] = a[i].result;
          if (i == depts.length - 1) {
            setLoading(false);
          }
        });
        setResources(resourcesObject);
      };

      fetchDepartments();
    }
  }, [processName]);

  const time_display = (duration: number) => {
    var seconds = Math.floor((duration / 1000) % 60);
    var minutes = Math.floor((duration / (1000 * 60)) % 60);
    var hours = Math.floor((duration / (1000 * 60 * 60)) % workingHours);
    var days = Math.floor((duration / (1000 * 60 * 60 * workingHours)) % 365);

    var hours_d = hours < 10 ? "0" + hours : hours;
    var minutes_d = minutes < 10 ? "0" + minutes : minutes;
    var seconds_d = seconds < 10 ? "0" + seconds : seconds;
    var days_d = days < 10 ? "0" + days : days;

    return days_d + "d " + hours_d + "h " + minutes_d + "m " + seconds_d + "s";
  };

  const bufferChange = (e: any) => {
    setbuffer(e.target.value);
  };

  const sendProject = async (e: any) => {
    e.preventDefault();
    const p_name = e.target.project_name.value;
    const city = e.target.location.value.trim().toLowerCase();
    const c_name = e.target.client_name.value;
    const c_email = e.target.client_email.value;
    const c_mobile = e.target.client_mobile.value;
    const b_time = buffer;
    const m = milestones;
    const pr_name = processes[Number(e.target.process.value)]["name"];
    const resources_arr: any = [];
    process_t.map((t, i) => {
      var resource = t.selected_resource;
      if (resources_arr.filter((r: string) => r == resource).length == 0) {
        resources_arr.push(resource);
      }
    });
    console.log(process_t);
    console.log(resources_arr);
    const res = await fetch(`${api}/admin/project/create`, {
      body: JSON.stringify({
        name: p_name,
        client: c_name,
        city: city,
        email: c_email,
        mobile_no: c_mobile,
        buffer: b_time,
        template: pr_name,
        process: process_t,
        resources: resources_arr,
        milestones: m,
      }),
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
    });
    const result = await res.json();
    if (result.status === "success") {
      location.replace("/admin/projects");
      // alert('Project created successfully');
    } else {
      alert("Error creating project");
    }
  };

  useEffect(() => {
    console.log(milestones);
  }, [milestones]);

  const deleteTask = (i: number) => {
    var newProcess = [...process_t];
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
      checklist: [],
      next: [],
      selected_resource: "",
      selected_resource_name: "",
    };
    // console.log("delete", newProcess)
    setProcess(newProcess);
  };

  interface Node {
    task_id: number;
    name: string;
    dept: string;
    checklist: string[];
    time_req: number;
    next: number[];
    selected_resource: string;
    selected_resource_name: string;
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
        <div className="flex flex-row items-center">
          <p className="text-white h-min px-6 py-3 border-3 border-[#343434]/70 bg-black outline-none transition duration-300 w-52 rounded-md text-sm">
            {node.name}
            <FontAwesomeIcon
              icon={faTrash as IconProp}
              className="ml-2 cursor-pointer"
              onClick={() => deleteTask(node.task_id)}
            />
            <br />
            <span className="text-white text-xs">
              {node.selected_resource && node.selected_resource !== "none"
                ? node.selected_resource_name
                : "No resource selected"}
            </span>
          </p>
        </div>
      )}
      {node.next && (
        <div className="flex flex-row items-start gap-4">
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
              <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
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
  }) => {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "start",
        }}
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
  };

  useEffect(() => {
    setTotalTime(time_display(processTime * buffer));
    // console.log(processTime, processTime* buffer, time_display(processTime), time_display(processTime*buffer));
  }, [process_t]);

  return (
    <>
      <Navbar username={b.company} avatarUrl={avatar} />

      <h1 className="font-primary text-white font-bold text-4xl">
        Project Creation
      </h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      <form className="flex flex-col gap-3" onSubmit={sendProject}>
        <div className="grid grid-cols-2 gap-3 items-center">
          <small className="text-white">Project Details:</small>
          <small className="text-white">Client Details:</small>
          <input
            type="text"
            placeholder="Project Name"
            name="project_name"
            className="w-[30rem] labelledInput"
          />
          <input
            type="text"
            placeholder="Client Name"
            name="client_name"
            className="w-[30rem] labelledInput"
          />
          <input
            type="text"
            placeholder="Location (City)"
            name="location"
            className="w-[30rem] labelledInput"
          />
          <input
            type="email"
            placeholder="Client Email"
            name="client_email"
            className="w-[30rem] labelledInput"
          />
          <input
            type="number"
            name="buffer"
            className="w-[30rem] labelledInput"
            min={1}
            max={5}
            step={0.01}
            placeholder="Buffer"
            onChange={(e) => bufferChange(e)}
            required
          />
          <input
            type="text"
            placeholder="Client Mobile"
            name="client_mobile"
            className="w-[30rem] labelledInput"
          />
          <select
            name="process"
            className="w-[30rem]"
            value={processName}
            onChange={(e) => setProcessName(e.target.value)}
            required
          >
            <option value="none" className="text-white/20">
              Select Process
            </option>
            {processes.map((p, i) => {
              return (
                <option value={i} key={i}>
                  {p["name"]}
                </option>
              );
            })}
          </select>
          <h3 className="font-primary text-white font-bold text-2xl">
            Time Required: {totalTime}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-primary text-white font-bold text-2xl">
              Resource Allocation
            </h3>

            <div className="flex flex-col gap-4">
              {resources
                ? Object.keys(resources).map((r, i) => {
                    return (
                      <div key={i} className="flex flex-col gap-2">
                        <h3 className="font-primary text-white text-sm">
                          {r}:
                        </h3>
                        <select
                          name={r}
                          className="w-[30rem]"
                          onChange={(e) => {
                            const newProcess = [...process_t];
                            newProcess.map((t: any, i: number) => {
                              if (t.dept == r) {
                                t.selected_resource = e.target.value;
                                t.selected_resource_name =
                                  e.target.options[e.target.selectedIndex]
                                    .text == "Select Resource"
                                    ? ""
                                    : e.target.options[e.target.selectedIndex]
                                        .text;
                              }
                            });
                            setProcess(newProcess);
                          }}
                          required
                        >
                          <option value="none" className="text-white/20">
                            Select Resource
                          </option>
                          {resources[r].map((res: any, i: number) => {
                            return (
                              <option value={res.id} key={i}>
                                {res.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })
                : ""}
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-primary text-white font-bold text-2xl">
              Process View
            </h3>

            <div className="flex items-start flex-col w-[80%] overflow-x-scroll scrollbar-thin scrollbar-track-[#0a0a0a] scrollbar-thumb-white/20 py-4">
              {process_t.length > 1 ? (
                loading ? (
                  <p className="text-white">Loading...</p>
                ) : (
                  <>
                    <TreeView nodes={[0]} allNodes={process_t} />
                  </>
                )
              ) : (
                ""
              )}
            </div>
          </div>
        </div>

        <div className="buttonBox">
          <input type="submit" />
        </div>
      </form>
    </>
  );
}
