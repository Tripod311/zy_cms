import React, { useState, useRef } from "react";

type Props = {
  title: string;
  fold?: boolean;
  children: React.ReactNode;
};

export default function Foldable ({ title, fold, children }: Props) {
  const [folded, setFolded] = useState(!!fold);

  const toggleFold = () => {
    setFolded(!folded);
  }

  return <div className="w-full overflow-hidden">
    <div className="w-full h-[50px] border-box bg-sky-700 text-white p-2 flex flex-row justify-between items-center">
      <span className="text-xl">{title}</span>
      <div className="bg-amber-400 hover:bg-yellow-400 p-2 rounded-xl text-black rounded cursor-pointer select-none" onClick={toggleFold}>
        {folded ? "Unfold" : "Fold"}
      </div>
    </div>
    {
      folded ? null :
      <div className="p-2 border border-sky-700 rounded-b">
        {children}
      </div>
    }
  </div>
}