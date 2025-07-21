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
};

export default function Home({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const [avatar, setAvatar] = useState<string | null>(null);

  const [clients, setClients] = useState([
    { id: "", name: "", email: "", mobile_no: "", address: "", password: "" },
  ]);
  const [ogPass, setOgPass] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState("");
  const [passwordEdit, setPasswordEdit] = useState(true);
  const [confimModalOpen, setConfirmModal] = useState(false);

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
    fetch(`${api}/admin/client/`, {
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
        setClients(data.result);
        clients.map((client) => {
          setOgPass((prev) => [...prev, client.password]);
        });
        // console.log(data);
        setLoading(false);
      });
  }, []);

  const deleteClient = async (id: string) => {
    const res = await fetch(`${api}/admin/client/delete`, {
      body: JSON.stringify({
        id: id,
      }),
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      method: "POST",
    });
    const result = await res.json();
    if (result.status !== "success") {
      alert(`Error: ${result.message} while deleting ${id}`);
      return;
    }
    location.reload();
  };

  const confirmModal = (id: string) => {
    setDeleteId(id);
    setConfirmModal(true);
    // console.log(id);
  };

  const handleSave = () => {
    clients.map((client, i) => {
      if (client.password != ogPass[i]) {
        fetch(`${api}/admin/client/edit`, {
          body: JSON.stringify({
            id: client.id,
            password: client.password,
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
          .then(() => {
            location.reload();
          });
      }
    });
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
              Are you sure you want to delete this client?
            </p>
            <div className="flex gap-4 mt-4">
              <button
                className="cancelButton bg-auto-red"
                onClick={() => deleteClient(deleteId)}
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
      <h1 className="font-primary text-white font-bold text-4xl">Clients</h1>
      <hr className="w-20 border-3 border-auto-red my-6" />
      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <table className="table-auto text-white w-full border-collapse border border-white/40 mb-6">
            <thead className="bg-black">
              <tr>
                <th className="border border-white/40 p-3">Name</th>
                <th className="border border-white/40 p-3">Email</th>
                <th className="border border-white/40 p-3">Mobile</th>
                <th className="border border-white/40 p-3">
                  Password&nbsp;&nbsp;&nbsp;
                  <FontAwesomeIcon
                    icon={faEdit as IconProp}
                    className="cursor-pointer"
                    onClick={() => {
                      setPasswordEdit(false);
                    }}
                  />
                </th>
                <th className="border border-white/40 p-3">Delete</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c, i) => {
                return (
                  <tr key={i}>
                    <td className="border border-white/40">
                      <input
                        type="text"
                        className="border-0 rounded-none text-white/80"
                        value={c["name"]}
                        readOnly
                      />
                    </td>
                    <td className="border border-white/40">
                      <input
                        type="email"
                        className="border-0 rounded-none text-white/80"
                        value={c["email"]}
                        readOnly
                      />
                    </td>
                    <td className="border border-white/40">
                      <input
                        type="text"
                        className="border-0 rounded-none text-white/80"
                        value={c["mobile_no"]}
                        readOnly
                      />
                    </td>
                    <td className="border border-white/40">
                      <input
                        type="text"
                        className="border-0 rounded-none text-white/80"
                        value={c["password"]}
                        readOnly={passwordEdit}
                        onChange={(e) => {
                          let newClients = [...clients];
                          newClients[i]["password"] = e.target.value;
                          setClients([...newClients]);
                        }}
                      />
                    </td>
                    <td
                      className="border border-white/40 text-white/60 hover:text-white/70 transition cursor-pointer text-center"
                      onClick={() => confirmModal(c["id"])}
                    >
                      <FontAwesomeIcon icon={faTrash as IconProp} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!passwordEdit && (
            <div className="buttonBox">
              <button className="submitButton" onClick={handleSave}>
                Save
              </button>
              <button
                className="cancelButton"
                onClick={() => location.reload()}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
