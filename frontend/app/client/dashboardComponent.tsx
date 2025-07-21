"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { use, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";

import { PieChart } from "@mui/x-charts/PieChart";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import { IconProp } from "@fortawesome/fontawesome-svg-core";

const api = process.env.NEXT_PUBLIC_APILINK;

type Props = {
  accessToken: string;
};

export default function Home({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));

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

  const [S_project, setS_project] = useState("");
  const [s_milestone, setS_milestone] = useState("");
  const [m_rating, setM_rating] = useState(0);

  const client_name = b.name;

  const [queryModalOpen, setQueryModalOpen] = useState(false);

  const [projects, setProjects] = useState([
    {
      id: "",
      name: "",
      deadline: "",
      process: [
        {
          name: "",
          status: 0,
        },
      ],
      milestones: [
        {
          name: "",
          tasks: [
            {
              time_req: 0,
              status: 0,
              percentage: 0,
            },
          ],
          rating: -1,
          client_satisfaction: -1,
        },
      ],
    },
  ]);

  const [queries, setQueries] = useState([
    {
      id: "",
      subject: "",
      status: 0,
      project_id: "",
      description: "",
      project_name: "",
      remark: "",
    },
  ]);

  const [v_query_name, setV_query_name] = useState("");
  const [v_query_project, setV_query_project] = useState("");
  const [v_query_description, setV_query_description] = useState("");
  const [v_query_status, setV_query_status] = useState(0);
  const [v_query_remark, setV_query_remark] = useState("");

  const openQueryModal = (id: any) => {
    const query = queries.filter((q) => q.id === id);
    setQueryModalOpen(true);
    setV_query_name(query[0].subject);
    const project = projects.filter((p) => p.id === query[0].project_id);
    setV_query_project(project[0].name);
    setV_query_description(query[0].description);
    setV_query_status(query[0].status);
    setV_query_remark(query[0].remark);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${api}/client/dashboard/projects`, {
          headers: {
            "Content-Type": "application/json",
            token: accessToken,
          },
          method: "GET",
        });
        const data = await res.json();
        setProjects(data.result);
        setLoading(false);
        console.log(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
    setInterval(fetchData, 60000);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${api}/client/dashboard/queries`, {
          headers: {
            "Content-Type": "application/json",
            token: accessToken,
          },
          method: "GET",
        });
        const data = await res.json();
        setQueries(data.result);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
    setInterval(fetchData, 60000);
  }, []);

  useEffect(() => {
    console.log(projects);
  }, [projects]);

  const theme = createTheme({ palette: { mode: "dark" } });

  const openRating = (project: string, milestone: string) => {
    setS_milestone(milestone);
    setS_project(project);
    setRatingModalOpen(true);
  };

  const submitRating = (e: any) => {
    e.preventDefault();
    console.log(S_project, s_milestone, m_rating);
    fetch(`${api}/client/review`, {
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
      body: JSON.stringify({
        id: S_project,
        milestone: s_milestone,
        rating: m_rating,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        setM_rating(0);
        setS_milestone("");
        setS_project("");
        setRatingModalOpen(false);
        location.reload();
      });
  };

  return (
    <>
      <Navbar instance="client" username={b.company} avatarUrl={avatar} />

      <div
        className={`fixed bg-black/50 backdrop-blur-[2px] inset-0 z-40 justify-center items-center flex transition duration-300 ${
          ratingModalOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-[#0a0a0a] rounded-lg p-8 absolute w-4/5 z-50">
          <h1 className="font-primary text-white font-bold text-4xl">
            Satisfaction for{" "}
            <span className="underline underline-offset-2 decoration-auto-red decoration-2">
              {s_milestone}
            </span>{" "}
            for{" "}
            <span className="underline underline-offset-2 decoration-2 decoration-auto-red">
              {projects.filter((p) => p.id == S_project)[0]?.name}
            </span>
          </h1>
          <hr className="w-20 border-3 border-auto-red my-6" />
          <div className="max-h-96 w-full text-white">
            <form
              onSubmit={submitRating}
              className="flex flex-col gap-4 w-1/2 ratingForm"
            >
              <p>
                <span className="font-semibold">Rating: </span>
                {m_rating}
              </p>
              <div className="flex gap-1 items-center cursor-pointer">
                <span
                  className="text-white"
                  onClick={() => {
                    setM_rating(0);
                  }}
                >
                  0
                </span>
                <span
                  className="text-transparent text-6xl stars w-max"
                  style={{
                    backgroundImage:
                      "linear-gradient(90deg, #AE0909 0%, #AE0909 " +
                      m_rating * 20 +
                      "%, #ffffff1a " +
                      m_rating / 5 +
                      "%)",
                  }}
                >
                  <span
                    onClick={(e) => {
                      if (
                        e.clientX <
                        (e.target as HTMLElement).getBoundingClientRect().left +
                          (e.target as HTMLElement).getBoundingClientRect()
                            .width /
                            4
                      )
                        setM_rating(0);
                      else if (
                        e.clientX <
                        (e.target as HTMLElement).getBoundingClientRect().left +
                          (e.target as HTMLElement).getBoundingClientRect()
                            .width /
                            2
                      )
                        setM_rating(0.5);
                      else setM_rating(1);
                    }}
                  >
                    ★
                  </span>
                  <span
                    onClick={(e) => {
                      if (
                        e.clientX <
                        (e.target as HTMLElement).getBoundingClientRect().left +
                          (e.target as HTMLElement).getBoundingClientRect()
                            .width /
                            2
                      )
                        setM_rating(1.5);
                      else setM_rating(2);
                    }}
                  >
                    ★
                  </span>
                  <span
                    onClick={(e) => {
                      if (
                        e.clientX <
                        (e.target as HTMLElement).getBoundingClientRect().left +
                          (e.target as HTMLElement).getBoundingClientRect()
                            .width /
                            2
                      )
                        setM_rating(2.5);
                      else setM_rating(3);
                    }}
                  >
                    ★
                  </span>
                  <span
                    onClick={(e) => {
                      if (
                        e.clientX <
                        (e.target as HTMLElement).getBoundingClientRect().left +
                          (e.target as HTMLElement).getBoundingClientRect()
                            .width /
                            2
                      )
                        setM_rating(3.5);
                      else setM_rating(4);
                    }}
                  >
                    ★
                  </span>
                  <span
                    onClick={(e) => {
                      if (
                        e.clientX <
                        (e.target as HTMLElement).getBoundingClientRect().left +
                          (e.target as HTMLElement).getBoundingClientRect()
                            .width /
                            2
                      )
                        setM_rating(4.5);
                      else setM_rating(5);
                    }}
                  >
                    ★
                  </span>
                </span>
                <span
                  className="text-white"
                  onClick={() => {
                    setM_rating(5);
                  }}
                >
                  5
                </span>
              </div>
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
        className={`fixed bg-black/50 backdrop-blur-[2px] inset-0 z-40 justify-center items-center flex transition duration-500 ${
          queryModalOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-[#0a0a0a] rounded-lg p-8 absolute w-4/5 z-50">
          <FontAwesomeIcon
            icon={faClose as IconProp}
            inverse
            className="cursor-pointer absolute right-8 top-8 h-5"
            onClick={() => {
              setQueryModalOpen(false);
            }}
          />
          <h1 className="font-primary text-white font-bold text-4xl pb-3">
            {v_query_name}
            {v_query_status == 1 || v_query_status == 3 ? " (Resolved)" : ""}
          </h1>

          <hr className="w-20 border-3 border-auto-red my-4" />
          <div className="flex flex-col gap-3">
            <big className="font-bold text-white">Project:</big>
            <input className="w-1/2" value={v_query_project} readOnly />
            <big className="font-bold text-white">Description:</big>
            <textarea
              className="w-1/2"
              value={v_query_description}
              readOnly
            ></textarea>
            {v_query_status == 1 ? (
              <>
                <big className="font-bold text-white">Remark:</big>
                <textarea
                  className="w-1/2"
                  value={v_query_remark}
                  readOnly
                ></textarea>
              </>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>

      <h1 className="font-primary text-white font-bold text-4xl">
        Client Dashboard
      </h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <h2 className="font-primary text-white font-bold text-2xl pb-3">
            Welcome, {client_name}
          </h2>

          <div className="grid grid-cols-2 gap-8">
            <div className="bg-black p-4 rounded-md flex flex-col gap-4">
              <h2 className="font-primary text-white font-bold text-2xl">
                Project Updates
              </h2>
              {projects.length > 0 ? (
                projects.map((p, i) => {
                  return p.name === "" ? (
                    "No Projects Found"
                  ) : (
                    <div key={i} className="flex flex-col gap-2">
                      <h3 className="font-primary text-white font-bold text-xl">
                        {p.name}
                      </h3>
                      <p className="text-white">
                        <b>Deadline:</b>{" "}
                        {`${new Date(p.deadline).getDate()}-${
                          new Date(p.deadline).getMonth() + 1
                        }-${new Date(p.deadline).getFullYear()}`}
                      </p>
                      {p.milestones.length === 0 ||
                      (p.milestones.length === 1 &&
                        p.milestones[0].name == "") ? (
                        ""
                      ) : (
                        <>
                          <h4 className="font-primary text-white font-semibold text-lg">
                            Milestones:
                          </h4>
                          <div className="grid grid-cols-3 gap-3 py-4">
                            {p.milestones.map((m, i) => {
                              if (m.name === "") return;
                              let complete = 0;
                              let incomplete = 100;
                              m.tasks?.map((t) => {
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
                                    className="font-primary text-white font-semibold w-full text-center truncate"
                                    title={m.name}
                                  >
                                    {m.name}
                                  </h4>
                                  {complete > 99 ? (
                                    m.client_satisfaction ? (
                                      <span className="text-white text-sm">
                                        Satisfaction: {m.client_satisfaction}
                                      </span>
                                    ) : (
                                      <button
                                        className="text-white text-sm underline decoration-auto-red decoration-2 underline-offset-2"
                                        onClick={() => {
                                          openRating(p.id, m.name);
                                        }}
                                      >
                                        Mark Satisfaction
                                      </button>
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
                        Progress:
                      </h4>
                      <div className="flex h-3 bg-white/10 rounded-md overflow-hidden">
                        <div
                          className="h-full bg-[#155303]"
                          style={{
                            width: `${
                              (p.process
                                .filter((pr) => pr.name != "")
                                .filter((pr) => pr.status === 1).length /
                                p.process.filter((pr) => pr.name != "")
                                  .length) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <hr className="opacity-20 mt-4" />
                    </div>
                  );
                })
              ) : (
                <p className="text-white">No projects found</p>
              )}
            </div>
            <div className="bg-black p-4 rounded-md flex flex-col gap-4">
              <h2 className="font-primary text-white font-bold text-2xl">
                Queries
              </h2>
              {queries.length > 0 ? (
                queries.map((q, i) => {
                  return q.subject === "" ? (
                    "No Queries Found"
                  ) : (
                    <div
                      key={i}
                      onClick={() => {
                        openQueryModal(q.id);
                      }}
                      className={
                        "cursor-pointer flex justify-between items-center border-3 border-[#343434]/30 px-6 py-3 rounded-lg" +
                        (q.status !== 0 && q.status !== 2
                          ? " bg-[#1553038f]"
                          : " bg-[#0a0a0a]")
                      }
                    >
                      <h3 className="font-primary text-white font-bold text-lg">
                        {q.subject}
                      </h3>
                      <p className="text-white text-sm">
                        {q.status == 0
                          ? "not resolved"
                          : q.status == 1
                            ? "resolved"
                            : q.status == 2
                              ? "not resolved"
                              : "resolved"}
                      </p>
                    </div>
                  );
                })
              ) : (
                <p className="text-white">No queries found</p>
              )}
              <button
                onClick={() => {
                  location.replace(`/client/query`);
                }}
                className="px-12 queryButton"
              >
                Raise Query
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
