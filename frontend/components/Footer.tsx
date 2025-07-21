"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";

type Props = {
  right?: boolean;
};

export default function Footer({ right }: Props) {
  const tprf = useRef<HTMLDivElement>(null);
  const drf = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const enc = {
      n: "PGEgY2xhc3M9InRyYW5zaXRpb24gZHVyYXRpb24tMzAwIGZvbnQtc2VtaWJvbGQgZWFzZS1pbi1vdXQgdW5kZXJsaW5lIGRlY29yYXRpb24tdHJhbnNwYXJlbnQgdW5kZXJsaW5lLW9mZnNldC0yIGRlY29yYXRpb24tMiBob3ZlcjpkZWNvcmF0aW9uLWF1dG8tcmVkIiBocmVmPSJodHRwczovL2dpdGh1Yi5jb20vTmFtYW5DaGFuZG9rIiB0YXJnZXQ9Il9ibGFuayI+TmFtYW48L2E+",
      a: "PGEgY2xhc3M9InRyYW5zaXRpb24gZHVyYXRpb24tMzAwIGZvbnQtc2VtaWJvbGQgZWFzZS1pbi1vdXQgdW5kZXJsaW5lIGRlY29yYXRpb24tdHJhbnNwYXJlbnQgdW5kZXJsaW5lLW9mZnNldC0yIGRlY29yYXRpb24tMiBob3ZlcjpkZWNvcmF0aW9uLWF1dG8tcmVkIiBocmVmPSJodHRwczovL2dpdGh1Yi5jb20vTmlnaHRmaXJlMzkwIiB0YXJnZXQ9Il9ibGFuayI+QWFkaXR5YTwvYT4=",
    };
    const inj = (str: string, el: HTMLDivElement) => {
      const dec = atob(str);
      const tmp = document.createElement("div");
      tmp.innerHTML = dec;
      const nde = tmp.firstChild;
      if (nde) {
        el.appendChild(nde);
      }
      return nde;
    };
    if (tprf.current) {
      tprf.current.innerHTML = "";
    }
    if (drf.current) {
      drf.current.innerHTML =
        "\u0026\u0063\u006f\u0070\u0079\u003b\u0020" +
        new Date().getFullYear() +
        "\u0020\u007c\u0020\u0026\u006e\u0062\u0073\u0070\u003b\u0044\u0065\u0076\u0065\u006c\u006f\u0070\u0065\u0064\u0020\u0062\u0079\u0026\u006e\u0062\u0073\u0070\u003b";
      inj(enc.n, drf.current);
      const spc = document.createTextNode("\u0020\u0026\u0020");
      drf.current.appendChild(spc);
      inj(enc.a, drf.current);
    }
  }, []);

  return (
    <>
      <div
        className={`flex flex-col gap-3 py-2 px-4 backdrop-blur-sm fixed rounded-md bg-black/30 bottom-6 ${
          right ? "right-6 text-right" : "left-6"
        }`}
      >
        <div className="flex gap-3">
          <Image src="/logo.svg" alt="logo" width={40} height={40} />
          <span className="border-l-2 border-auto-red pl-3 font-primary tracking-tight text-white">
            Automata
          </span>
        </div>
        <div ref={tprf} className="flex gap-2"></div>
        <div
          ref={drf}
          className="font-primary leading-5 text-white text-xs tracking-tight"
        ></div>
      </div>
    </>
  );
}
