import { useState, useEffect } from "react";
import ListIcon from "../../images/list.svg";

type Props = {
  columns: string[];
  visible: string[];
  onChange: (v: string[]) => void;
}

export default function TableColumns ({ columns, visible, onChange }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState<string[]>(visible);

  const toggleExpand = () => {
    setExpanded(!expanded);
  }

  const handleChange = (event, col) => {
    event.stopPropagation();
    event.preventDefault();

    const index = value.indexOf(col);
    let nv = value.slice();
    if (index === -1) {
      nv.push(col);
      setValue(nv);
    } else {
      nv = nv.filter(c => { return c != col });
      setValue(nv);
    }

    onChange(columns.filter(c => { return nv.includes(c) }));
  };

  return <div className="absolute top-0 left-0 cursor-pointer z-10 bg-white border" onClick={toggleExpand}>
    <img src={ListIcon} className="w-[15px] h-[15px]" />
    {
      !expanded ? null :
      <div className="p-2 flex flex-col">
        {
          columns.map(col => {
            return <div className="flex flex-row items-center gap-2" onClick={(e) => {handleChange(e, col)}}>
              <input type="checkbox" className="pointer-events-none" checked={value.includes(col)} />
              <label>{col}</label>
            </div>
          })
        }
      </div>
    }
  </div>
}