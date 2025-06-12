import { useState, useEffect, useRef } from "react";
import Arrow from "../images/arrow_black.svg";
import { DBSchemaObject } from "../types";

type Props = {
  schema: DBSchemaObject;
  onSelected: (id: string) => void;
};

export default function Overlay ({schema, onSelected}: Props) {
  const overlayRef = useRef<HTMLElement>(null);

  const logout = async () => {
    await fetch("/admin/api/logout", {
      method: "POST",
      body: "{}"
    });

    window.location.reload();
  }

  return <div className="w-full h-full fixed top-0 left-0 pt-[50px] pointer-events-none">
    <div className="absolute top-0 left-0 w-full h-[50px] shadow-xl bg-white p-2 flex flex-row-reverse justify-between items-center pointer-events-auto">
      <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none" onClick={logout}>
        Logout
      </div>
      <img src={Arrow} className="w-[30px] h-[30px] cursor-pointer md:hidden" />
    </div>
    <div className="w-full h-full relative">

      <div
        ref={overlayRef}
        className="absolute w-full h-full top-0 left-0"
      >
        
      </div>

    </div>
  </div>;
}