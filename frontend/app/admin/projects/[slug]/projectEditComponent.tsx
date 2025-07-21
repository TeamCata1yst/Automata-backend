"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
  const [p_loading, setP_loading] = useState(true);

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
  const [project_name, setProject_name] = useState("");

  const [project_location, setProject_location] = useState("");
  const [project_buffer, setProject_buffer] = useState(0);

  const [client_name, setClient_name] = useState("");
  const [client_mobile, setClient_mobile] = useState("");
  const [client_email, setClient_email] = useState("");

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
      selected_resource: "",
      selected_resource_name: "",
    },
  ]);

  const [resourcesArray, setResourcesArray] = useState<String[]>([]);

  useEffect(() => {
    const getProcess = async (pr: string) => {
      const res = await fetch(`${api}/admin/project/id/${pr}`, {
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
        location.replace("/admin/projects");
      } else {
        setTasks(data.result["process"]);
        setProject_name(data.result["name"]);
        setProject_location(data.result["city"]);
        setProject_buffer(data.result["buffer"]);
        setClient_name(data.result["client"]);
        setClient_mobile(data.client["mobile_no"]);
        setClient_email(data.client["email"]);
        setResourcesArray(data.result["resources"]);
        setLoading(false);
      }
    };
    getProcess(p_id);
  }, [p_id]);

  interface Node {
    task_id: number;
    name: string;
    dept: string;
    checklist: stringObject[];
    time_req: number;
    next: number[];
    selected_resource: string;
    selected_resource_name: string;
  }
  interface ResourcesObject {
    [key: string]: any;
  }
  const [resources, setResources] = useState<ResourcesObject>({});

  const [selectedResources, setSelectedResources] = useState([
    {
      task_id: 0,
      resource_id: "",
    },
  ]);

  useEffect(() => {
    console.log(tasks);
    const fetchDepartments = async () => {
      var depts: String[] = [];
      const promises = tasks.map((t: any) => {
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
      const resourcesObject = { ...resources };

      depts.map((t: any, i: number) => {
        if (t == "") return;
        if (t == "none") return;
        resourcesObject[t] = a[i].result;
        // console.log(a[i].result);
      });
      tasks.map((t: any, i: number) => {
        if (t.dept != "" && t.dept != "none") {
          selectedResources.push({
            task_id: t.task_id,
            resource_id: t.selected_resource,
          });
        }
        if (i == tasks.length - 1) setP_loading(false);
        // console.log(t.selected_resource.length)
      });
      setResources(resourcesObject);
      setSelectedResources(selectedResources);
      console.log(selectedResources);
    };

    fetchDepartments();
  }, [tasks]);

  // useEffect(() => { console.log(selectedResources); }, [selectedResources]);

  const TreeNode: React.FC<{ node: Node; allNodes: Node[]; level: number }> = ({
    node,
    allNodes,
    level,
  }) => {
    let resource = "";
    let resourcesArray = selectedResources.filter(
      (t) => t.task_id == node.task_id,
    );
    if (resourcesArray.length > 0) {
      resource = resourcesArray[0].resource_id;
    }
    // console.log(resource);
    return (
      <div className="flex flex-col items-start">
        {node.name === "" ? (
          <div className="bg-[#252525] h-3 w-3 ml-2.5 rounded-full"></div>
        ) : (
          <div className="flex flex-col items-start">
            <div className="bg-[#252525] w-[2px] h-4 ml-4"></div>
            <div className="flex flex-row items-center">
              <p className="text-white h-min px-6 py-3 border-3 border-[#343434]/70 bg-black outline-none transition duration-300 w-52 rounded-md text-sm">
                {node.name}
                <br />
                {/* {resource} */}
                <span className="text-white text-xs">
                  {node.selected_resource && node.selected_resource !== "none"
                    ? node.selected_resource_name
                    : "No resource selected"}
                </span>
              </p>
            </div>
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
  };

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

  const sendProject = async (e: any) => {
    e.preventDefault();
    let tasksArray = tasks;
    let selectedResourcesArray = resourcesArray;
    tasksArray.forEach((t) => {
      console.log(
        t.name,
        selectedResources.findIndex((s) => s.task_id == t.task_id),
      );
      if (resourcesArray.filter((r) => r == t.selected_resource).length == 0) {
        selectedResourcesArray.push(t.selected_resource);
      }
    });
    selectedResourcesArray = selectedResourcesArray.filter(
      (r) => tasksArray.filter((t) => t.selected_resource == r).length > 0,
    );
    console.log(tasksArray);
    console.log(selectedResourcesArray);
    const res = await fetch(`${api}/admin/project/update`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
      body: JSON.stringify({
        id: p_id,
        name: project_name,
        city: project_location,
        buffer: project_buffer,
        client: client_name,
        mobile_no: client_mobile,
        email: client_email,
        process: tasksArray,
        resources: selectedResourcesArray,
      }),
    });
    const data = await res.json();
    if (data.status === "success") {
      location.replace("/admin/projects");
    } else {
      alert(JSON.stringify(data));
    }
  };

  return (
    <>
      <Navbar username={b.company} avatarUrl={avatar} />

      <h1 className="font-primary text-white font-bold text-4xl">
        {project_name}
      </h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <form className="flex flex-col gap-3" onSubmit={sendProject}>
            <div className="grid grid-cols-2 gap-3 items-center">
              <small className="text-white">Project Details:</small>
              <small className="text-white">Client Details:</small>
              <input
                type="text"
                name="p_name"
                className="w-[30rem] labelledInput"
                value={project_name}
                onChange={(e) => {
                  setProject_name(e.target.value);
                }}
              />
              <input
                type="text"
                name="c_name"
                className="w-[30rem] labelledInput"
                value={client_name}
                onChange={(e) => {
                  setClient_name(e.target.value);
                }}
              />
              <input
                type="text"
                name="location"
                className="w-[30rem] labelledInput"
                value={project_location}
                onChange={(e) => {
                  setProject_location(e.target.value);
                }}
              />
              <input
                type="email"
                name="c_email"
                className="w-[30rem] labelledInput"
                value={client_email}
                onChange={(e) => {
                  setClient_email(e.target.value);
                }}
              />
              <input
                type="number"
                name="buffer"
                min={1}
                max={5}
                step={0.01}
                className="w-[30rem] labelledInput"
                value={project_buffer}
                onChange={(e) => {
                  setProject_buffer(Number(e.target.value));
                }}
              />
              <input
                type="text"
                name="c_mobile"
                className="w-[30rem] labelledInput"
                value={client_mobile}
                onChange={(e) => {
                  setClient_mobile(e.target.value);
                }}
              />
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
                              value={
                                tasks.filter((t) => t.dept == r)[0]
                                  .selected_resource
                              }
                              className="w-[30rem]"
                              onChange={(e) => {
                                const newProcess = [...tasks];
                                newProcess.map((t: any, i: number) => {
                                  if (t.dept == r) {
                                    t.selected_resource = e.target.value;
                                    t.selected_resource_name =
                                      e.target.options[e.target.selectedIndex]
                                        .text == "Select Resource"
                                        ? ""
                                        : e.target.options[
                                            e.target.selectedIndex
                                          ].text;
                                  }
                                });
                                setTasks(newProcess);
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
                  {p_loading ? (
                    <p className="text-white">Loading...</p>
                  ) : tasks.length > 1 ? (
                    <TreeView nodes={[0]} allNodes={tasks} />
                  ) : (
                    <p className="text-white">No Tasks Found</p>
                  )}
                </div>
              </div>
            </div>

            <div className="buttonBox">
              <input type="submit" value="Save" className="submitButton" />
              <Link href="/admin/projects" className="cancelButton">
                Cancel
              </Link>
            </div>
          </form>
        </>
      )}
    </>
  );
}
