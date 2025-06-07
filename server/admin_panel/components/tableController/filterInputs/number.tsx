import { useState, useEffect } from "react";
import { FilterField } from "../../../types";

type Props = {
  title: string;
  initialValue?: FilterField<number>;
  onChange: (nv: FilterField<number>) => void;
}

export default function NumberInput ({ title, initialValue, onChange }: Props) {
  const [value, setValue] = useState<FilterField<number>>(initialValue || {type: "none", value: ""});

  const typeChange = (e) => {
    setValue({
      type: e.target.value,
      value: ""
    });
  }

  const valueChange = (e) => {
    const v = parseFloat(e.target.value);

    if (!isNaN(v)) {
      setValue({
        type: value.type,
        value: v
      });
    }
  }

  useEffect(() => {
    onChange(value);
  }, [value]);

  return <div className="p-2 rounded-xl border flex flex-row gap-2 justify-between">
    <span className="text-lg">{title}</span>
    <div className="flex flex-col gap-2 max-w-[50%]">
      <select className="rounded-xl p-2 border" value={value.type} onChange={typeChange}>
        <option value="none">Not active</option>
        <option value="lt">lt</option>
        <option value="gt">gt</option>
        <option value="lte">lte</option>
        <option value="gte">gte</option>
        <option value="eq">eq</option>
        <option value="ne">ne</option>
      </select>
      <input type="number" className="rounded-xl p-2 border" value={value.value} onInput={valueChange} />
    </div>
  </div>
}