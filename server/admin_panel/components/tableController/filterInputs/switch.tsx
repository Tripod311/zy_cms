import { FilterField } from "../../../types";

type Props = {
  title: string;
  value?: FilterField<boolean>;
  onChange: (nv: FilterField<boolean>) => void;
}

export default function SwitchInput ({ title, value, onChange }: Props) {
  return <div className="p-2 rounded-xl border flex flex-col gap-2">
    <span className="text-lg">{title}</span>
    <input type="checkbox" className="w-[30px] h-[30px]" checked={value?.value} onChange={(e) => {
      onChange({
        type: "eq",
        value: e.target.checked
      });
    }} />
  </div>
}