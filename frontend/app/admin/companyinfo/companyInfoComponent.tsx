"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

const api = process.env.NEXT_PUBLIC_APILINK;

type Props = {
  accessToken: string;
};

export default function Home({ accessToken }: Props) {
  const a = accessToken.split(".")[1];
  const b = JSON.parse(atob(a));
  const [loading, setLoading] = useState(true);

  const [avatar, setAvatar] = useState<string | null>(null);

  useEffect(() => {
    if (b.company_info) {
      fetch(`${api}/org`, {
        headers: {
          "Content-Type": "application/json",
          Token: accessToken,
        },
        method: "GET",
      })
        .then((res) => res.json())
        .then((data) => {
          // console.log(data);
          setComp_name(data.result.comp_name);
          setAddress(data.result.address);
          setComp_phone(data.result.comp_phone);
          setFirst_day(data.result.first_day);
          setHours(data.result.hours);
          setWeekend(data.result.weekend.length);
          setStart_time(data.result.start_time);
          setLinkedin(data.result.linkedin);
          setFacebook(data.result.facebook);
          setInstagram(data.result.instagram);
          setTwitter(data.result.twitter);
          setLoading(false);
        });

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
          setPreview(URL.createObjectURL(new File([bytearr], "logo.png")));
          setAvatar(URL.createObjectURL(new File([bytearr], "avatar.png")));
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const [comp_name, setComp_name] = useState("");
  const [address, setAddress] = useState("");
  const [comp_phone, setComp_phone] = useState("");
  const [first_day, setFirst_day] = useState("");
  const [hours, setHours] = useState("");
  const [weekend, setWeekend] = useState("");
  const [start_time, setStart_time] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [comp_logo, setComp_logo] = useState(null);
  const [preview, setPreview] = useState("");

  const handleLogoChange = (e: any) => {
    const file = e.target.files[0];
    setComp_logo(file);
    setPreview(URL.createObjectURL(file));
  };

  const submitForm = async (e: any) => {
    e.preventDefault();
    if (
      e.target.first_day.value === "none" ||
      e.target.weekend.value === "none"
    ) {
      alert("Please fill all the fields");
      return;
    }
    let weekendSend: any = [];
    if (e.target.weekend.value === "2") {
      weekendSend = [6, 0];
    } else if (e.target.weekend.value === "1") {
      weekendSend = [0];
    }

    if (comp_logo) {
      const logo_send = new FormData();
      logo_send.append("comp_logo", comp_logo);
      const logo_res = await fetch(`${api}/org/logo`, {
        method: "POST",
        body: logo_send,
        headers: {
          Token: accessToken,
        },
      });
      const logo_data = await logo_res.json();
      console.log(logo_data);
    }

    const res = await fetch("/api/comp_info", {
      body: JSON.stringify({
        accessToken: accessToken,
        comp_name: e.target.comp_name.value,
        address: e.target.address.value,
        comp_phone: e.target.comp_phone.value,
        first_day: e.target.first_day.value,
        hours: Number(e.target.hours.value),
        weekend: weekendSend,
        start_time: e.target.start_time.value,
        linkedin: e.target.linkedin.value,
        facebook: e.target.facebook.value,
        instagram: e.target.instagram.value,
        twitter: e.target.twitter.value,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const data = await res.json();
    console.log(data);
    if (data.status === "success") {
      location.reload();
    }
  };

  return (
    <>
      <Navbar
        instance={b.company_info ? "" : "new_comp"}
        username={b.company_info ? b.company : ""}
        avatarUrl={avatar}
      />

      <h1 className="font-primary text-white font-bold text-4xl">
        Company Info
      </h1>
      <hr className="w-20 border-3 border-auto-red my-6" />

      {loading ? (
        <p className="text-white">Loading...</p>
      ) : (
        <>
          <form className="grid md:grid-cols-3 gap-6" onSubmit={submitForm}>
            <div className="flex gap-3">
              {b.company_info ? (
                <>
                  <input
                    type="file"
                    name="comp_logo"
                    id="compLogo"
                    onChange={handleLogoChange}
                    style={{ appearance: "none", display: "none" }}
                  />
                  <label
                    htmlFor="compLogo"
                    className={`relative group rounded-md h-12 w-12 flex-shrink-0`}
                  >
                    {preview && (
                      <Image
                        src={preview}
                        alt="Company Logo"
                        className="h-12 w-12 rounded-full absolute z-10"
                        width={0}
                        height={0}
                      />
                    )}
                    <span
                      className={`bg-black/60 border-3 ${preview ? "rounded-full text-white" : "rounded-md text-[#6e6e6e]"} border-[#343434]/40 absolute h-12 w-12 justify-center flex items-center group-hover:z-20 z-0`}
                    >
                      <FontAwesomeIcon icon={faFileUpload as IconProp} />
                    </span>
                  </label>
                </>
              ) : (
                ""
              )}
              <input
                type="text"
                name="comp_name"
                value={comp_name}
                onChange={(e) => setComp_name(e.target.value)}
                placeholder="Company Name"
                readOnly={b.company_info}
                className={
                  b.company_info
                    ? "p-0 border-none bg-transparent font-primary text-white font-bold text-2xl"
                    : ""
                }
              />
            </div>
            <select
              name="first_day"
              value={first_day}
              onChange={(e) => setFirst_day(e.target.value)}
              required
            >
              <option value="none" className="text-white/20">
                First Day of Week
              </option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
              <option value="sunday">Sunday</option>
            </select>
            <input
              type="text"
              name="linkedin"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              placeholder="LinkedIn Profile Link"
            />
            <textarea
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Company Address"
              className="row-span-2"
              required
            ></textarea>
            <input
              type="number"
              className="px-6 py-3 border-3 border-[#343434]/40 bg-black outline-none transition duration-300 w-full rounded-md text-sm text-white/50 placeholder:text-white/20 focus:text-white appearance-none focus:border-[#343434]/70 focus:placeholder:text-white/30"
              name="hours"
              step={0.1}
              min={0}
              max={24}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="Working Hours (Decimal)"
              required
            />
            <input
              type="text"
              name="facebook"
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="Facebook Profile Link"
            />
            <select
              name="weekend"
              value={weekend}
              onChange={(e) => setWeekend(e.target.value)}
              required
            >
              <option value="none" className="text-white/20">
                Weekend Off
              </option>
              <option value="0">Working</option>
              <option value="1">Saturday Working</option>
              <option value="2">Off</option>
            </select>
            <input
              type="text"
              name="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Instagram Profile Link"
            />
            <input
              type="tel"
              name="comp_phone"
              value={comp_phone}
              onChange={(e) => setComp_phone(e.target.value)}
              placeholder="Company Phone"
              required
            />
            <input
              type="text"
              name="start_time"
              value={start_time}
              onChange={(e) => setStart_time(e.target.value)}
              placeholder="Work Start Time (24 hour format)"
              required
            />
            <input
              type="text"
              name="twitter"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="Twitter Profile Link"
            />
            <div className="buttonBox">
              <input type="submit" />
            </div>
          </form>
        </>
      )}
    </>
  );
}
