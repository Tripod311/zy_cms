type Props = {
	title: string;
	value: string;
	onChange: (v: string) => void;
}

export default function StringInput ({ title, value, onChange }: Props) {
	return <div className="w-full grid grid-cols-[200px_auto] gap-2 items-center">
		<span className="grow-1 text-lg truncate">{title}</span>
		<input type="text" className="p-2 rounded border" value={value} onInput={e => {
			const v = parseFloat(e.target.value);

			if (!isNaN(v)) onChange(v);
		}}/>
	</div>
}