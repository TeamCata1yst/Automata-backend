"use client";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEdit,
  faTrash,
  faCopy,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";

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

  const [processes, setProcesses] = useState([]);

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
        // console.log(data);

        setLoading(false);
      });
  }, []);

  // useEffect(() => {
  // console.log(processes);
  // }, [processes]);

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

  const DeleteProcess = (id: string) => {
    fetch(`${api}/admin/project/template/delete`, {
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
        console.log(data);
        location.reload();
      });
  };

  const CopyProcess = (id: string) => {
    fetch(`${api}/admin/project/template/copy`, {
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
        console.log(data);
        location.reload();
      });
  };

  const [confimModalOpen, setConfirmModal] = useState(false);

  const [deleteId, setDeleteId] = useState("");

  const openConfirmModal = (id: string) => {
    setDeleteId(id);
    setConfirmModal(true);
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
              Are you sure you want to delete this process?
            </p>
            <div className="flex gap-4 mt-4">
              <button
                className="cancelButton bg-auto-red"
                onClick={() => DeleteProcess(deleteId)}
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

      <h1 className="font-primary text-white font-bold text-4xl">Processes</h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <table className="table-auto text-white w-full border-collapse border border-white/40 mb-6">
            <thead className="bg-black">
              <tr>
                <th className="border border-white/40 p-3">Name</th>
                <th className="border border-white/40 p-3">Time Required</th>
                <th className="border border-white/40 p-3">View</th>
                <th className="border border-white/40 p-3">Edit</th>
                <th className="border border-white/40 p-3">Copy</th>
                <th className="border border-white/40 p-3">Delete</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((p, i) => {
                return (
                  <tr key={i}>
                    <td className="border border-white/40">
                      <input
                        type="text"
                        className="border-0 rounded-none text-white/80"
                        value={p["name"]}
                        readOnly
                      />
                    </td>
                    <td className="border border-white/40">
                      <input
                        type="text"
                        className="border-0 rounded-none text-white/80"
                        value={time_display(p["time"])}
                        readOnly
                      />
                    </td>
                    <td className="border border-white/40 text-center">
                      <Link href={`/admin/process/view/${p["_id"]}`}>
                        <FontAwesomeIcon icon={faEye as IconProp} />
                      </Link>
                    </td>
                    <td className="border border-white/40 text-center">
                      <Link href={`/admin/process/${p["_id"]}`}>
                        <FontAwesomeIcon icon={faEdit as IconProp} />
                      </Link>
                    </td>
                    <td
                      className="border border-white/40 text-center cursor-pointer"
                      onClick={() => CopyProcess(p["_id"])}
                    >
                      <FontAwesomeIcon icon={faCopy as IconProp} />
                    </td>
                    <td
                      className="border border-white/40 text-center cursor-pointer"
                      onClick={() => openConfirmModal(p["_id"])}
                    >
                      <FontAwesomeIcon icon={faTrash as IconProp} />
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-black">
                <td colSpan={6}>
                  <Link
                    href="/admin/process/create"
                    className="p-2 text-center text-lg w-full block text-white"
                  >
                    +
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </>
      )}
    </>
  );
}
