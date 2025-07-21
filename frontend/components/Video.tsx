import React from "react";

type Props = {
  url: string;
};

export default function Video({ url }: Props) {
  return (
    <div className="w-full h-screen shrink-0 md:w-1/2 bg-slate-100/10">
      <iframe
        className="w-full h-full"
        src={url}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </div>
  );
}
