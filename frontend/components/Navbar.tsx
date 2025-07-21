"use client";
import React from "react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOut,
  faAngleDoubleLeft,
} from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import Link from "next/link";

type Props = {
  instance?: string;
  username?: string;
  avatarUrl?: string | null;
};

export default function Navbar({ instance, username, avatarUrl }: Props) {
  function handleClick() {
    const navbar = document.getElementById("side-nav");
    const toggle = document.querySelector(".side-nav-toggle");
    const visibility = navbar!.getAttribute("data-visible");
    if (visibility === "false") {
      navbar!.setAttribute("data-visible", "true");
      toggle!.setAttribute("aria-expanded", "true");
    } else {
      navbar!.setAttribute("data-visible", "false");
      toggle!.setAttribute("aria-expanded", "false");
    }
  }

  const handleResourceLogout = async () => {
    const res = await fetch("/api/logout");
    const data = await res.json();
    if (data.status == "200") {
      location.replace("/resource/login");
    }
  };

  const handleClientLogout = async () => {
    const res = await fetch("/api/logout");
    const data = await res.json();
    if (data.status == "200") {
      location.replace("/client/login");
    }
  };

  const handleAdminLogout = async () => {
    const res = await fetch("/api/logout");
    const data = await res.json();
    if (data.status == "200") {
      location.replace("/admin/login");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-2 p-6 z-30 md:px-16 flex justify-between items-center transition duration-300 ease-in-out bg-[#010101]">
      <div className="flex gap-6 items-center">
        {instance == "login" ? (
          ""
        ) : instance == "resource" || instance == "client" ? (
          <div className="relative group">
            <small className="absolute w-max -bottom-7 -left-5 text-white opacity-0 group-hover:opacity-100 bg-[#343434] p-1 px-2 rounded-sm text-xs transition-all duration-300">
              Log Out
              <div className="custom-shape-divider-bottom-1710661777 absolute bottom-full left-0 w-full overflow-hidden leading-[0] rotate-180">
                <svg
                  className="relative block w-full h-3"
                  data-name="Layer 1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M649.97 0L550.03 0 599.91 54.12 649.97 0z"
                    className="fill-[#343434]"
                  ></path>
                </svg>
              </div>
            </small>
            {instance == "resource" ? (
              <FontAwesomeIcon
                icon={faSignOut as IconProp}
                className="cursor-pointer text-white h-6"
                id="logOutIcon"
                onClick={handleResourceLogout}
              />
            ) : (
              <FontAwesomeIcon
                icon={faSignOut as IconProp}
                className="cursor-pointer h-6 text-white"
                id="logOutIcon"
                onClick={handleClientLogout}
              />
            )}
          </div>
        ) : instance == "client-query" || instance == "resource-query" ? (
          <div className="relative group">
            <small className="absolute w-max -bottom-7 -left-5 text-white opacity-0 group-hover:opacity-100 bg-[#343434] p-1 px-2 rounded-sm text-xs transition-all duration-300">
              Go Back
              <div className="custom-shape-divider-bottom-1710661777 absolute bottom-full left-0 w-full overflow-hidden leading-[0] rotate-180">
                <svg
                  className="relative block w-full h-3"
                  data-name="Layer 1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 1200 120"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M649.97 0L550.03 0 599.91 54.12 649.97 0z"
                    className="fill-[#343434]"
                  ></path>
                </svg>
              </div>
            </small>
            {instance == "resource-query" ? (
              <FontAwesomeIcon
                icon={faAngleDoubleLeft as IconProp}
                className="cursor-pointer text-white h-6"
                id="logOutIcon"
                onClick={() => {
                  location.replace("/resource");
                }}
              />
            ) : (
              <FontAwesomeIcon
                icon={faAngleDoubleLeft as IconProp}
                className="cursor-pointer h-6 text-white"
                id="logOutIcon"
                onClick={() => {
                  location.replace("/client");
                }}
              />
            )}
          </div>
        ) : (
          <button
            className="side-nav-toggle transition duration-300 ease-in-out"
            aria-controls="side-nav"
            aria-expanded="false"
            onClick={handleClick}
          ></button>
        )}

        <Link
          className="text-xl text-white font-semibold tracking-tight flex items-center gap-3"
          href="/"
        >
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
          <span className="font-primary tracking-tight">Automata</span>
        </Link>
      </div>

      {instance == "login" || instance == "terms"
        ? ""
        : avatarUrl && (
            <div className="flex items-center gap-3 text-lg font-primary leading-5 text-white tracking-tight">
              <Image
                src={avatarUrl}
                className="rounded-full"
                alt="user"
                width={35}
                height={35}
              />
              {username}
            </div>
          )}
      <nav
        id="side-nav"
        data-visible="false"
        className="transition duration-300 ease-in-out fixed inset-y-0 inset-x-0 left-0 -translate-x-full z-20 flex py-24 px-16 bg-[#010101] flex-col h-full w-96 text-lg text-white font-primary gap-6 underline decoration-transparent underline-offset-2 decoration-2"
      >
        <Link
          className="transition duration-300 ease-in-out hover:decoration-auto-red"
          href="/admin"
        >
          Home
        </Link>
        <Link
          className="transition duration-300 ease-in-out hover:decoration-auto-red"
          href="/admin/profile"
        >
          Profile
        </Link>
        <Link
          className="transition duration-300 ease-in-out hover:decoration-auto-red"
          href="/admin/companyinfo"
        >
          Company Info
        </Link>
        {instance == "new_comp" ? (
          ""
        ) : (
          <>
            <Link
              className="transition duration-300 ease-in-out hover:decoration-auto-red"
              href="/admin/departments"
            >
              Departments
            </Link>
            <Link
              className="transition duration-300 ease-in-out hover:decoration-auto-red"
              href="/admin/resources"
            >
              Resources
            </Link>
            <Link
              className="transition duration-300 ease-in-out hover:decoration-auto-red"
              href="/admin/clients"
            >
              Clients
            </Link>
            <Link
              className="transition duration-300 ease-in-out hover:decoration-auto-red"
              href="/admin/process"
            >
              Processes
            </Link>
            <Link
              className="transition duration-300 ease-in-out hover:decoration-auto-red"
              href="/admin/projects"
            >
              Projects
            </Link>
          </>
        )}
        <button
          className="transition duration-300 ease-in-out bg-auto-red/80 hover:bg-auto-red py-2 mt-6 rounded-md w-full text-center cursor-pointer"
          onClick={handleAdminLogout}
        >
          <FontAwesomeIcon icon={faSignOut as IconProp} className="pr-1" /> Sign
          Out
        </button>
      </nav>
    </nav>
  );
}
