type Props = {
	title: string;
	value: string;
	onChange: (v: string) => void;
}

export default function StringInput ({ title, value, onChange }: Props) {
	return <div className="w-full grid grid-cols-[200px_auto] gap-2 items-center">
		<span className="grow-1 text-lg truncate">{title}</span>
		<input type="checkbox" className="p-2 w-[30px] h-[30px]" checked={value} onChange={e => {
			onChange(e.target.checked);
		}}/>
	</div>
}