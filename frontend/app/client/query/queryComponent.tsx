"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { use, useEffect, useState } from "react";

const api = process.env.APILINK;

type Props = {
  accessToken: string;
};

export default function Query({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const c_id = b.id;

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
      id: "",
      name: "",
    },
  ]);

  const [resources_display, setResourcesDisplay] = useState([
    {
      id: "",
      name: "",
    },
  ]);

  const [project, setProject] = useState("none");

  const [projects, setProjects] = useState([
    {
      id: "",
      name: "",
      deadline: "",
      process: [
        {
          name: "",
          status: 0,
          selected_resource: "",
        },
      ],
    },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${api}/client/dashboard/projects`, {
          headers: {
            "Content-Type": "application/json",
            Token: accessToken,
          },
          method: "GET",
        });
        const data = await res.json();
        setProjects(data.result);
        const res2 = await fetch(`${api}/client/user`, {
          headers: {
            "Content-Type": "application/json",
            Token: accessToken,
          },
          method: "GET",
        });
        const data2 = await res2.json();
        // console.log(data2);
        setResources(data2.result);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  // useEffect(() => { console.log(resources) }, [resources]);

  // useEffect(() => { console.log(resources_display) }, [resources_display]);

  useEffect(() => {
    console.log(project);
    if (project === "none") {
      setResourcesDisplay([]);
    }
    let re: any = [];
    let p = projects.filter((p) => p.id === project)[0];
    p?.process.forEach((t) => {
      if (t.name === "") return;
      if (!t.selected_resource || t.selected_resource === "") return;
      const r = resources.filter((r) => r.id === t.selected_resource)[0];
      // console.log(r);
      if (!re.includes(r)) {
        re.push(r);
      }
    });
    console.log(re);
    setResourcesDisplay(re);
  }, [project]);

  const sendQuery = async (e: any) => {
    console.log("Query Sent");
    e.preventDefault();
    const q_subject = e.target.subject.value;
    const q_project = e.target.project.value;
    const q_resource = e.target.resource.value;
    const q_description = e.target.description.value;
    const q_client = c_id;
    const res = await fetch(`${api}/client/dashboard/queries/add`, {
      body: JSON.stringify({
        subject: q_subject,
        project_id: q_project,
        resource_id: q_resource,
        description: q_description,
        client_id: q_client,
      }),
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
    });
    const data = await res.json();
    if (data.status === "success") {
      location.replace("/client");
    } else {
      alert(data.error);
    }
  };

  return (
    <>
      <Navbar instance="client-query" username={b.company} avatarUrl={avatar} />
      <h1 className="font-primary text-white font-bold text-4xl">
        Query Creation
      </h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      <form onSubmit={sendQuery} className="flex flex-col gap-4">
        <input
          type="text"
          name="subject"
          className="w-1/2"
          placeholder="Subject"
        />
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          name="project"
          className="w-1/2"
        >
          <option value="none">Select Project</option>
          {projects.map((p, i) => {
            return (
              <option key={i} value={p.id}>
                {p.name}
              </option>
            );
          })}
        </select>
        <select name="resource" className="w-1/2">
          <option value="none">Select Resource</option>
          {resources_display.map((p, i) => {
            return (
              <option key={i} value={p.id}>
                {p.name}
              </option>
            );
          })}
        </select>
        <textarea
          placeholder="Description"
          className="w-1/2"
          name="description"
        ></textarea>
        <input type="submit" />
      </form>
    </>
  );
}
