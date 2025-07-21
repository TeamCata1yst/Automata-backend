"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEye, faEdit } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type Props = {
  accessToken: string;
};

const api = process.env.APILINK;

export default function Home({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

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

  const [new_password, setNewPassword] = useState("");
  const [confirm_password, setConfirmPassword] = useState("");

  const [view_new_password, setViewNewPassword] = useState(false);
  const [view_confirm_password, setViewConfirmPassword] = useState(false);

  const [edit_name, setEditName] = useState(false);
  const [edit_email, setEditEmail] = useState(false);

  const [admin_name, setAdminName] = useState("");
  const [admin_email, setAdminEmail] = useState("");

  useEffect(() => {
    const fetchAdmin = async () => {
      const response = await fetch(`${api}/admin/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Token: accessToken,
        },
      });
      const data = await response.json();
      if (data.status === "unauthorized") {
        const res_l = await fetch("/api/logout");
        const data_l = await res_l.json();
        if (data_l.status === "200") {
          location.replace("/admin/login");
        }
      } else if (data.status === "success") {
        setAdminName(data.result.name);
        setAdminEmail(data.result.email);
        setLoading(false);
      } else {
        alert(data.message);
      }
    };
    fetchAdmin();
  }, []);

  const sendPassword = async (e: any) => {
    e.preventDefault();
    if (new_password === confirm_password) {
      const response = await fetch(`${api}/admin/profile/edit/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Token: accessToken,
        },
        body: JSON.stringify({
          new_password: new_password,
        }),
      });
      const data = await response.json();
      if (data.status === "success") {
        alert("Password changed successfully!");
        setPasswordModalOpen(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.message);
      }
    } else {
      alert("Passwords do not match");
    }
  };

  const saveChanges = async (e: any) => {
    e.preventDefault();
    const response = await fetch(`${api}/admin/profile/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: accessToken,
      },
      body: JSON.stringify({
        name: admin_name,
        email: admin_email,
      }),
    });
    const data = await response.json();
    if (data.status === "success") {
      const res = await fetch("/api/logout");
      const data = await res.json();
      if (data.status == "200") {
        location.replace("/admin/login");
      }
    } else {
      alert(data.message);
    }
  };

  return (
    <>
      <Navbar username={b.company} avatarUrl={avatar} />

      <div
        className={`fixed bg-black/50 backdrop-blur-[2px] inset-0 z-40 justify-center items-center flex transition duration-500 ${
          passwordModalOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="bg-[#0a0a0a] rounded-lg p-8 absolute w-4/5 z-50">
          <FontAwesomeIcon
            icon={faClose as IconProp}
            inverse
            className="cursor-pointer absolute right-8 top-8 h-5"
            onClick={() => {
              setPasswordModalOpen(false);
            }}
          />
          <h1 className="font-primary text-white font-bold text-4xl pb-3">
            Change Password
          </h1>

          <hr className="w-20 border-3 border-auto-red my-4" />
          <form className="flex flex-col gap-3 w-1/2" onSubmit={sendPassword}>
            <div className="relative">
              <small className="font-bold text-white absolute left-3 -z-1">
                New Password:
              </small>
              <div
                className="flex items-center gap-3 transition-all"
                style={new_password == "" ? {} : { marginTop: "1.75rem" }}
              >
                <input
                  className="relative z-10"
                  name="new_password"
                  type={view_new_password ? "text" : "password"}
                  placeholder="New Password"
                  value={new_password}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <FontAwesomeIcon
                  icon={faEye as IconProp}
                  inverse
                  className="cursor-pointer"
                  onClick={() => {
                    setViewNewPassword(!view_new_password);
                  }}
                />
              </div>
            </div>
            <div className="relative">
              <small className="font-bold text-white absolute left-3">
                Confirm New Password:
              </small>
              <div
                className="flex items-center gap-3 transition-all"
                style={confirm_password == "" ? {} : { marginTop: "1.75rem" }}
              >
                <input
                  className="transition-all relative z-10"
                  name="confirm_password"
                  type={view_confirm_password ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirm_password}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <FontAwesomeIcon
                  icon={faEye as IconProp}
                  inverse
                  className="cursor-pointer"
                  onClick={() => {
                    setViewConfirmPassword(!view_confirm_password);
                  }}
                />
              </div>
            </div>
            <input type="submit" value="Change Password" />
          </form>
        </div>
      </div>

      <h1 className="font-primary text-white font-bold text-4xl">
        Admin Profile
      </h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <form className="flex flex-col gap-3" onSubmit={saveChanges}>
            <big className="font-bold text-white">Admin Name:</big>
            <div className="flex items-center gap-3">
              <input
                className="w-1/2"
                value={admin_name}
                readOnly={!edit_name}
                onChange={(e) => {
                  setAdminName(e.target.value);
                }}
              />
              <FontAwesomeIcon
                icon={faEdit as IconProp}
                inverse
                className="cursor-pointer"
                onClick={() => {
                  setEditName(true);
                }}
              />
            </div>
            <big className="font-bold text-white">Admin Email:</big>
            <div className="flex items-center gap-3">
              <input
                className="w-1/2"
                value={admin_email}
                readOnly={!edit_email}
                onChange={(e) => {
                  setAdminEmail(e.target.value);
                }}
              />
              <FontAwesomeIcon
                icon={faEdit as IconProp}
                inverse
                className="cursor-pointer"
                onClick={() => {
                  setEditEmail(true);
                }}
              />
            </div>
            <div className="space-x-3">
              {edit_email || edit_name ? (
                <input type="submit" value="Save Changes" />
              ) : (
                ""
              )}
              <button
                className="cancelButton"
                onClick={(e) => {
                  e.preventDefault();
                  setPasswordModalOpen(true);
                }}
              >
                Change Password
              </button>
            </div>
            {edit_email || edit_name ? (
              <small className="text-white">
                Saving will log you out from this session.
              </small>
            ) : (
              ""
            )}
          </form>
        </>
      )}
    </>
  );
}
