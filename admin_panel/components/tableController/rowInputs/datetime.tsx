type Props = {
  title: string;
  value: string;
  onChange: (v: string) => void;
}

export default function DateInput ({ title, value, onChange }: Props) {
  return <div className="w-full grid grid-cols-[200px_auto] gap-2 items-center">
    <span className="grow-1 text-lg truncate">{title}</span>
    <input type="datetime-local" className="rounded-xl p-2 border" value={value ? value.slice(0, 16) : null} onChange={(e) => {
        const value = e.target.value;
        const iso = new Date(value).toISOString();
        onChange(iso);
      }} />
  </div>
}