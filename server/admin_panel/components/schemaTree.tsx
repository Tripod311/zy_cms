import { useState, useEffect } from "react";
import { DBSchemaObject } from "../types";

type Props = {
  schema: DBSchemaObject;
  onSelected: (id: string) => void;
};

export default function SchemaTree ({ schema, onSelected }: Props) {
  const [selectedTable, setSelected] = useState<string>('');

  const onSelect = (tname) => {
    setSelected(tname);
    onSelected(tname);
  }

  return <div className="w-full h-full overflow-y-auto border-box">
    <div class="h-full flex flex-col border-r">
      {Object.keys(schema).map(tname => {
        if (tname === selectedTable) {
          return <div key={tname} className="bg-slate-200 cursor-pointer text-xl p-2">{tname}</div>
        } else {
          return <div key={tname} className="cursor-pointer text-xl p-2" onClick={() => {onSelect(tname)}}>{tname}</div>
        }
      })}
    </div>
  </div>;
}