"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";

import { PieChart } from "@mui/x-charts/PieChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClose,
  faEdit,
  faEye,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";

type Props = {
  accessToken: string;
};

const api = process.env.APILINK;

export default function Home({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const theme = createTheme({ palette: { mode: "dark" } });

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
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [qeuryModalOpen, setQueryModalOpen] = useState(false);
  const [projects, setProjects] = useState<any>([]);

  const [confimModalOpen, setConfirmModal] = useState(false);
  const [deleteId, setDeleteId] = useState("");

  const [clients, setClients] = useState([]);

  const [resources, setResources] = useState<any>([]);

  const [queryView, setQueryView] = useState(false);
  const [queryEdit, setQueryEdit] = useState(false);
  const [query_desc, setQuery_desc] = useState("");

  const [cities, setCities] = useState([]);

  const [s_query, setS_query] = useState<any>({});

  const [s_client, setS_client] = useState("none");
  const [s_city, setS_city] = useState("none");

  const [s_milestone, setS_milestone] = useState("");
  const [m_rating, setM_rating] = useState(0);

  const [queries_filter, setQueries_filter] = useState(false);

  const [filteredProjects, setFilteredProjects] = useState<any>([]);
  const [s_query_resource, setS_query_resource] = useState<any>({});

  const [S_project, setS_project] = useState<any>({});

  const [queries, setQueries] = useState<any>([]);
  const [project, setProject] = useState("none");

  const [process, setProcess] = useState<any>([]);

  const fetchProjects = async () => {
    const response = await fetch(`${api}/admin/project`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "GET",
    });
    const data = await response.json();
    if (data.status === "unauthorized") {
      const res_l = await fetch("/api/logout");
      const data_l = await res_l.json();
      if (data_l.status === "200") {
        location.replace("/admin/login");
      }
    }
    // console.log(data);
    setProjects([...data]);
    setFilteredProjects([...data]);
    setLoading(false);
  };

  const getQueries = async (p_id: any) => {
    const res = await fetch(`${api}/admin/query/${p_id}`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "GET",
    });
    const data = await res.json();
    setQueries(data.result);
  };

  useEffect(() => {
    fetchProjects();
    fetch(`${api}/admin/user`, {
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
        // console.log(data);
        setResources(data.result);
      });
  }, []);

  useEffect(() => {
    console.log(project);
    if (project === "none") {
      setProcess([]);
      return;
    }
    setProcess([...projects.filter((p: any) => p.id === project)[0].process]);
    setS_project({ ...projects.filter((p: any) => p.id === project)[0] });
    getQueries(project);
    // let resources1:any = [];
    // projects.filter((p:any) => p.id === project)[0].process.forEach((task:any) => {
    //   if (task.dept === "") return;
    //   if (!resources1.includes(task.selected_resource)) {
    //     resources1.push(task.selected_resource);
    //   }
    // });
    // let resources2:any = resources.filter((r:any) => resources1.includes(r.id));
    // setP_resources(resources2);
    const interval = setInterval(() => {
      const og = project;
      fetchProjects();

      setProject("none");
      setTimeout(() => {
        setProject(og);
      }, 300);
    }, 40000);
    return () => clearInterval(interval);
  }, [project]);

  // useEffect(() => {console.log(projects)}, [projects]);
  // useEffect(() => {console.log(queries)}, [queries]);

  projects.sort((a: any, b: any) => a["priority"] - b["priority"]);

  useEffect(() => {
    let clients: any = [];
    let cities: any = [];
    projects.forEach((p: any) => {
      if (p.client === "" || p.city === "") return;
      if (!clients.includes(p.client)) {
        clients.push(p.client);
      }
      if (!cities.includes(p.city)) {
        cities.push(p.city);
      }
    });
    setClients(clients);
    setCities(cities);
  }, [projects]);

  useEffect(() => {
    if (s_client === "none" && s_city === "none") {
      setFilteredProjects(projects);
      return;
    }
    let a_filteredProjects = projects.filter((p: any) => {
      if (s_client !== "none" && s_city !== "none") {
        return p.client === s_client && p.city === s_city;
      } else if (s_client !== "none") {
        return p.client === s_client;
      } else if (s_city !== "none") {
        return p.city === s_city;
      }
    });
    setFilteredProjects(a_filteredProjects);
    setProcess([]);
    const selectP = document.getElementById(
      "project_select",
    ) as HTMLSelectElement;
    selectP.selectedIndex = 0;
  }, [s_client, s_city]);

  interface stringObject {
    text: string;
  }

  interface Node {
    task_id: number;
    name: string;
    dept: string;
    checklist: stringObject[];
    time_req: number;
    next: number[];
    status: number;
    deadline: string;
    remark: string;
    selected_resource: string;
  }

  const t_n = new Date();

  const openRating = (milestone: string) => {
    setS_milestone(milestone);
    setRatingModalOpen(true);
  };

  const createQuery = async (e: any) => {
    e.preventDefault();
    const res = await fetch(`${api}/admin/query/add`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
      body: JSON.stringify({
        project_id: S_project.id,
        subject: e.target.subject.value,
        resource_id: e.target.resource.value,
        description: e.target.description.value,
      }),
    });
    const data = await res.json();
    // console.log(data);
    setQueryModalOpen(false);
    e.target.reset();
    getQueries(S_project.id);
  };

  const openQueryModal = (id: any, edit?: boolean) => {
    setQueryView(true);
    setQueryEdit(edit || false);
    if (edit) {
      const query = queries.filter((q: any) => q.id === id)[0];
      setQuery_desc(query.description);
    }
    const query = queries.filter((q: any) => q.id === id)[0];
    setS_query(query);
    setQueryModalOpen(true);
    setS_query_resource(
      resources.filter((r: any) => r.id === query.resource_id)[0],
    );
  };

  const submitRating = (e: any) => {
    e.preventDefault();
    fetch(`${api}/admin/review`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
      body: JSON.stringify({
        id: S_project.id,
        milestone: s_milestone,
        rating: m_rating,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        // console.log(data);
        setM_rating(0);
        setS_milestone("");
        setRatingModalOpen(false);
        location.reload();
      });
  };

  const deleteQuery = (id: any) => {
    fetch(`${api}/admin/query/delete`, {
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
        console.log(data);
        setQueries(queries.filter((q: any) => q.id !== id));
        setConfirmModal(false);
      });
  };

  const openConfirmModal = (id: string) => {
    setConfirmModal(true);
    setDeleteId(id);
  };

  const saveQuery = (id: any) => {
    fetch(`${api}/admin/query/edit`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
      body: JSON.stringify({
        id: id,
        description: query_desc,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setQueries(
          queries.map((q: any) =>
            q.id === id ? { ...q, description: query_desc } : q,
          ),
        );
        setQueryModalOpen(false);
        setQueryView(false);
        setQueryEdit(false);
      });
  };

  useEffect(() => {
    if (queries_filter) {
      setQueries(queries.filter((q: any) => q.status === 0 || q.status === 2));
    } else {
      getQueries(S_project.id);
    }
  }, [queries_filter]);

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
              className="text-white mr-4 h-min px-6 py-3 border-3 border-[#343434]/70 bg-black outline-none transition duration-300 w-52 rounded-md text-sm"
              style={
                node.status === 1
                  ? { backgroundColor: "#155303" } //green
                  : node.status === 2
                    ? { backgroundColor: "#9aa109" } //yellow-green
                    : node.status === -1
                      ? { backgroundColor: "#95050d" } //red
                      : Date.parse(node.deadline) < Date.parse(t_n.toString())
                        ? { backgroundColor: "#95050d" } //red
                        : node.status === 4
                          ? { backgroundColor: "#1f009d" } //blue
                          : {}
              }
            >
              {node.name}
              <br />
              <small>
                <b>Resource:</b>{" "}
                {
                  resources.filter(
                    (resource: any) => resource.id === node.selected_resource,
                  )[0]?.name
                }
              </small>
              <br />
              <small>
                <b>Deadline:</b>{" "}
                {`${new Date(node.deadline).getDate()}-${
                  new Date(node.deadline).getMonth() + 1
                }-${new Date(node.deadline).getFullYear()}`}
              </small>
              <br />
              {/* <small><b>ID:</b> {node.task_id}</small><br />  */}
              {node.status === -1 ? (
                <small>
                  <b>Remark:</b> {node.remark}
                </small>
              ) : (
                ""
              )}
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
              Are you sure you want to delete this query?
            </p>
            <div className="flex gap-4 mt-4">
              <button
                className="submitButton"
                onClick={() => deleteQuery(deleteId)}
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

      <div
        className={`fixed bg-black/50 backdrop-blur-[2px] inset-0 z-40 justify-center items-center flex transition duration-300 ${
          ratingModalOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-[#0a0a0a] rounded-lg p-8 absolute w-4/5 z-50">
          <h1 className="font-primary text-white font-bold text-4xl">
            Mark Quality for{" "}
            <span className="underline underline-offset-2 decoration-auto-red decoration-2">
              {s_milestone}
            </span>
          </h1>
          <hr className="w-20 border-3 border-auto-red my-6" />
          <div className="max-h-96 flex w-full flex-row gap-8 text-white overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            <form
              onSubmit={submitRating}
              className="flex flex-col gap-4 w-1/2 ratingForm"
            >
              <p>
                <span className="font-semibold">Quality of Work: </span>
                <input
                  type="number"
                  value={m_rating}
                  onChange={(e) => setM_rating(Number(e.target.value))}
                  min={0}
                  max={10}
                  step={0.1}
                  className="appearance-none bg-transparent outline-none"
                />
              </p>
              <input
                type="range"
                min={0}
                max={10}
                step={0.1}
                value={m_rating}
                onChange={(e) => setM_rating(Number(e.target.value))}
              />
              <p className="space-x-4">
                <input type="submit" />
                <button
                  onClick={() => {
                    setRatingModalOpen(false);
                    setS_milestone("");
                    setM_rating(0);
                  }}
                  className="cancelButton"
                >
                  Cancel
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>

      <div
        className={`fixed bg-black/50 backdrop-blur-[2px] inset-0 z-40 justify-center items-center flex transition duration-300 ${
          qeuryModalOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-[#0a0a0a] rounded-lg p-8 absolute w-4/5 z-50">
          {queryView ? (
            <>
              <button
                className="absolute top-8 right-8 text-white"
                onClick={(e) => {
                  e.preventDefault();
                  setQueryModalOpen(false);
                  setQueryView(false);
                  setQueryEdit(false);
                }}
              >
                <FontAwesomeIcon icon={faClose as IconProp} />
              </button>
              <h1 className="font-primary text-white font-bold text-4xl">
                {s_query.subject}
              </h1>
              <hr className="w-20 border-3 border-auto-red my-6" />
              <div className="flex flex-col gap-3">
                <small className="text-white">
                  <b>Description:</b>
                </small>
                {queryEdit ? (
                  <textarea
                    value={query_desc}
                    onChange={(e) => setQuery_desc(e.target.value)}
                  ></textarea>
                ) : (
                  <p className="text-white">{s_query.description}</p>
                )}

                {s_query.remark ? (
                  <>
                    <small className="text-white">
                      <b>Remark:</b>
                    </small>
                    <p className="text-white">{s_query.remark}</p>
                  </>
                ) : (
                  ""
                )}
                {s_query_resource?.name && (
                  <small className="text-white mt-2">
                    <b>Resource:</b> {s_query_resource.name}
                  </small>
                )}
                <small className="text-white">
                  <b>Status:</b>{" "}
                  {s_query.status == 0
                    ? "Open"
                    : s_query.status == 1
                      ? "Resolved"
                      : s_query.status == 2
                        ? "Task Created"
                        : "Resolved"}
                </small>
                {queryEdit && (
                  <button
                    onClick={() => saveQuery(s_query.id)}
                    className="submitButton"
                  >
                    Save Changes
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h1 className="font-primary text-white font-bold text-4xl">
                Raise New Query
              </h1>
              <hr className="w-20 border-3 border-auto-red my-6" />
              <div className="max-h-96 flex w-full flex-row gap-8 text-white overflow-y-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
                <form
                  onSubmit={createQuery}
                  className="flex flex-col gap-4 w-1/2 queryForm"
                >
                  <input type="text" name="subject" placeholder="Subject" />
                  <select name="resource">
                    <option value="none">Select Resource</option>
                    {resources.map((r: any, i: any) => {
                      return (
                        <option value={r.id} key={i}>
                          {r.name}
                        </option>
                      );
                    })}
                  </select>
                  <textarea name="description" placeholder="Description" />
                  <div className="space-x-4">
                    <button
                      onClick={(e) => {
                        const form = document.querySelector(
                          ".queryForm",
                        ) as HTMLFormElement;
                        e.preventDefault();
                        setQueryModalOpen(false);
                        form.reset();
                      }}
                      className="cancelButton"
                    >
                      Cancel
                    </button>
                    <input type="submit" />
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      <h1 className="font-primary text-white font-bold text-4xl">Task View</h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      <div className="flex justify-between items-center">
        <div className="space-x-3">
          <Link href="/admin/" className="bg-auto-red cancelButton">
            Project Wise
          </Link>
          <Link
            href="/admin/resource_wise"
            className="bg-auto-red/50 cancelButton"
          >
            Resource Wise
          </Link>
          {/* <a href='/admin/client_wise' className='bg-auto-red/50 cancelButton'>Client Wise</a> */}
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
          <div className="flex flex-col gap-3">
            <div className="space-y-2">
              <small className="text-white">Filters:</small>
              <div className="flex gap-3">
                <select
                  name="client"
                  id="client_select"
                  className="w-64"
                  onChange={(e) => {
                    setS_client(e.target.value);
                  }}
                >
                  <option value="none">Select Client</option>
                  {clients.map((p, i) => {
                    return (
                      <option value={p} key={i}>
                        {p}
                      </option>
                    );
                  })}
                </select>
                <select
                  name="city"
                  id="city_select"
                  className="w-64"
                  onChange={(e) => {
                    setS_city(e.target.value);
                  }}
                >
                  <option value="none">Select Location</option>
                  {cities.map((p, i) => {
                    return (
                      <option value={p} key={i}>
                        {p}
                      </option>
                    );
                  })}
                </select>
              </div>
              <select
                name="project"
                id="project_select"
                className="w-[32.75rem]"
                onChange={(e) => {
                  setProject(e.target.value);
                }}
              >
                <option value="none">Select Project</option>
                {filteredProjects.map((p: any, i: any) => {
                  if (p.name === "") return;
                  return (
                    <option value={p.id} key={i}>
                      {p.name}
                    </option>
                  );
                })}
              </select>
            </div>
            {process.length > 1 ? (
              <div className="flex gap-4">
                <div className="w-3/4 overflow-x-scroll scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 py-4">
                  <TreeView nodes={[0]} allNodes={[...process]} />
                </div>
                <div className="bg-black flex-grow-0 h-max mt-8 rounded-lg w-1/4 flex p-4 flex-col gap-2">
                  <h2 className="font-primary text-white font-bold text-xl pb-2">
                    {S_project.name}
                  </h2>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <small className="text-white">
                        <b>Client:</b> {S_project.client}
                      </small>
                      <small className="text-white">
                        <b>Location:</b> {S_project.city}
                      </small>
                      <small className="text-white">
                        <b>Deadline:</b>{" "}
                        {`${new Date(S_project.deadline).getDate()}-${
                          new Date(S_project.deadline).getMonth() + 1
                        }-${new Date(S_project.deadline).getFullYear()}`}
                      </small>
                      <small className="text-white">
                        <b>Priority:</b> {S_project.priority + 1}
                      </small>
                    </div>
                  </div>
                  <h4 className="font-primary text-white font-semibold text-lg">
                    Progress:{" "}
                  </h4>
                  <div className="flex h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#155303]"
                      title={`${(
                        (S_project.process
                          .filter((pr: any) => pr.name != "")
                          .filter(
                            (pr: any) => pr.status === 1 || pr.status === 2,
                          ).length /
                          S_project.process.filter((pr: any) => pr.name != "")
                            .length) *
                        100
                      ).toFixed(2)}%`}
                      style={{
                        width: `${
                          (S_project.process
                            .filter((pr: any) => pr.name != "")
                            .filter(
                              (pr: any) => pr.status === 1 || pr.status === 2,
                            ).length /
                            S_project.process.filter((pr: any) => pr.name != "")
                              .length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  {S_project.milestones.length === 0 ? (
                    ""
                  ) : (
                    <>
                      <h4 className="font-primary text-white font-semibold text-lg">
                        Milestones:{" "}
                      </h4>
                      <div className="grid grid-cols-2 gap-3 py-4">
                        {S_project.milestones.map((m: any, i: any) => {
                          if (m.name === "" || !m.tasks || m.tasks?.length == 0)
                            return;
                          // console.log(m);
                          let complete = 0;
                          let incomplete = 100;
                          m.tasks?.map((t: any) => {
                            if (t.status === 1 || t.status === 2) {
                              complete += t.percentage;
                              incomplete -= t.percentage;
                            }
                          });
                          return (
                            <div
                              key={i}
                              className="flex flex-col gap-2 items-center"
                            >
                              <ThemeProvider theme={theme}>
                                <PieChart
                                  skipAnimation
                                  series={[
                                    {
                                      data: [
                                        {
                                          value: complete,
                                          color: "#155303",
                                        },
                                        {
                                          value: incomplete,
                                          color: "#ffffff1a",
                                        },
                                      ],
                                      valueFormatter: (item: {
                                        value: number;
                                      }) => `${item.value.toFixed(2)}%`,
                                      cx: 90,
                                      innerRadius: 25,
                                    },
                                  ]}
                                  width={180}
                                  height={90}
                                />
                              </ThemeProvider>
                              <h4
                                className="font-primary text-white font-semibold truncate w-full text-center"
                                title={m.name}
                              >
                                {m.name}
                              </h4>
                              {incomplete < 1 ? (
                                m.rating < 0 ? (
                                  <button
                                    className="text-white text-sm underline decoration-auto-red decoration-2 underline-offset-2"
                                    onClick={() => {
                                      openRating(m.name);
                                    }}
                                  >
                                    Mark Quality
                                  </button>
                                ) : (
                                  <span className="text-white text-sm">
                                    QoW: {m.rating}
                                  </span>
                                )
                              ) : (
                                <span className="text-white text-sm">
                                  {complete.toFixed(1)}% Completed
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                  <h4 className="font-primary text-white font-semibold text-lg">
                    Queries:{" "}
                  </h4>
                  <div className="flex flex-col gap-2">
                    <button
                      className="cancelButton bg-auto-red"
                      onClick={(e) => {
                        e.preventDefault();
                        setQueryModalOpen(true);
                      }}
                    >
                      + Raise Query
                    </button>
                    <div className="flex items-center">
                      <input
                        checked={queries_filter}
                        onChange={(e) => {
                          setQueries_filter(e.target.checked);
                        }}
                        type="checkbox"
                        id="openOnly"
                        className="scale-75"
                      />
                      <label className="text-xs text-white" htmlFor="openOnly">
                        Show Open Only
                      </label>
                    </div>
                    {queries.length === 0 ? (
                      <small className="text-white">No queries</small>
                    ) : (
                      queries.map((q: any, i: any) => {
                        return (
                          <div
                            key={i}
                            className={
                              "space-y-1 border-3 border-[#343434]/40 px-6 py-3 rounded-lg" +
                              (q.status !== 0 && q.status !== 2
                                ? " bg-[#1553038f]"
                                : " bg-black")
                            }
                          >
                            <p className="text-white font-semibold">
                              {q.subject}
                            </p>
                            <small className="text-white">
                              {q.status == 0
                                ? "Open"
                                : q.status == 1
                                  ? "Resolved"
                                  : q.status == 2
                                    ? "Task Created"
                                    : "Resolved with Task"}
                            </small>
                            <p className="space-x-3">
                              <FontAwesomeIcon
                                icon={faEye as IconProp}
                                className="text-white cursor-pointer"
                                onClick={() => {
                                  openQueryModal(q.id);
                                }}
                              />
                              {q.status == 0 && (
                                <FontAwesomeIcon
                                  icon={faEdit as IconProp}
                                  className="text-white cursor-pointer"
                                  onClick={() => {
                                    openQueryModal(q.id, true);
                                  }}
                                />
                              )}
                              <FontAwesomeIcon
                                icon={faTrash as IconProp}
                                className="text-white cursor-pointer"
                                onClick={() => {
                                  openConfirmModal(q["id"]);
                                }}
                              />
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
          </div>
        </>
      )}
    </>
  );
}
