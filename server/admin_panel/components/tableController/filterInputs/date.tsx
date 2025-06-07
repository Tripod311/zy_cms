import { useState, useEffect } from "react";
import { FilterField } from "../../../types";

type Props = {
  title: string;
  initialValue?: FilterField<string>;
  onChange: (nv: FilterField<string>) => void;
}

export default function TextInput ({ title, initialValue, onChange }: Props) {
  const [value, setValue] = useState<FilterField<string>>(initialValue || {type: "gte", value: ""});

  const typeChange = (e) => {
    setValue({
      type: e.target.value,
      value: ""
    });
  }

  const valueChange = (e) => {
    setValue({
      type: value.type,
      value: e.target.value
    });
  }

  useEffect(() => {
    onChange(value);
  }, [value]);

  return <div className="p-2 rounded-xl border flex flex-row gap-2 justify-between">
    <span className="text-lg">{title}</span>
    <div className="flex flex-col gap-2 max-w-[50%]">
      <select className="rounded-xl p-2 border" value={value.type} onChange={typeChange}>
        <option value="lt">lt</option>
        <option value="gt">gt</option>
        <option value="lte">lte</option>
        <option value="gte">gte</option>
        <option value="eq">eq</option>
        <option value="ne">ne</option>
      </select>
      <input type="datetime-local" className="rounded-xl p-2 border" value={value.value} onChange={(e) => {
        const value = e.target.value;
        const iso = new Date(value).toISOString();
        valueChange(iso);
      }} />
    </div>
  </div>
}