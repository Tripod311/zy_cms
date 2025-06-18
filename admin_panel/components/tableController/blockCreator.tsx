import { useState, useEffect } from "react";
import { DBTableObject, DBJSType } from "../../types";

export interface BlockCreatorValue {
  column: string;
  operator: string;
  value: number | string | boolean;
};

export default function BlockCreator ({schema, onAdd}: { schema: DBTableObject; onAdd: (v: BlockCreatorValue) => void; }) {
  const [value, setValue] = useState<BlockCreatorValue>({column: "", operator: "", value: ""});

  const onColumnChange = (e) => {
    const nv = Object.assign({}, value);
    nv.column = e.target.value;
    setValue(nv); 
  }

  const onOperatorChange = (e) => {
    const nv = Object.assign({}, value);
    nv.operator = e.target.value;
    setValue(nv);
  }

  const onValueChange = (v) => {
    const nv = Object.assign({}, value);
    nv.value = v;
    setValue(nv);
  }

  const getOperatorsForType = (type: DBJSType): { type: string; title: string; }[] => {
    switch (type) {
      case "string":
      case "markdown":
      case "json":
        return [
          { type: "like", title: "LIKE" },
          { type: "lt", title: "<" },
          { type: "gt", title: ">" },
          { type: "lte", title: "<=" },
          { type: "gte", title: ">=" },
          { type: "eq", title: "=" },
          { type: "ne", title: "!=" },
        ];
      case "number":
        return [
          { type: "lt", title: "<" },
          { type: "gt", title: ">" },
          { type: "lte", title: "<=" },
          { type: "gte", title: ">=" },
          { type: "eq", title: "=" },
          { type: "ne", title: "!=" },
        ];
      case "datetime":
        return [
          { type: "lt", title: "<" },
          { type: "gt", title: ">" },
          { type: "lte", title: "<=" },
          { type: "gte", title: ">=" },
          { type: "eq", title: "=" },
          { type: "ne", title: "!=" },
        ];
      case "boolean":
        return [
          { type: "eq", title: "=" },
          { type: "ne", title: "!=" },
        ];
      default:
        return []
    }
  }

  const getValueFieldForType = (type: DBJSType) => {
    switch (type) {
      case "string":
      case "markdown":
      case "json":
        return <input type="text" className="rounded border" value={value.value} onInput={e => onValueChange(e.target.value)} />;
      case "number":
        return <input type="number" className="rounded border" value={value.value} onInput={e => onValueChange(e.target.value)} />;
      case "datetime":
        return <input type="datetime-local" className="rounded border" value={value.value.slice(0, 16)} onChange={(e) => {
          const value = e.target.value;
          const iso = new Date(value).toISOString();
          onValueChange(iso);
        }} />;
      case "boolean":
        return <input type="checkbox" className="w-[30px] h-[30px]" checked={value.value} onChange={(e) => {
          onValueChange(e.target.checked);
        }} />;
      default:
        return null;
    }
  }

  return <div className="absolute top-0 left-0 p-2 bg-white rounded-xl border z-15 flex flex-col">
    <div className="p-2 flex flex-row gap-2 items-center">
      <span>Column</span>
      <select className="rounded border" onChange={onColumnChange} value={value.column}>
        <option value="">- Select Column - </option>
        {
          Object.keys(schema).map(col => {
            return <option key={col} value={col}>{col}</option>
          })
        }
      </select>
    </div>
    {
      value.column !== "" ?
      <div className="p-2 flex flex-row gap-2 items-center">
        <span>Operator</span>
        <select className="rounded border" onChange={onOperatorChange} value={value.operator}>
          <option value="">- Select Operator - </option>
          {
            getOperatorsForType(schema[value.column].type).map(op => {
              return <option key={op.type} value={op.type}>{op.title}</option>
            })
          }
        </select>
      </div> : null
    }
    {
      (value.column !== "" && value.operator !== "") ?
        <div className="p-2 flex flex-row gap-2 items-center">
          <span>Value</span>
          { getValueFieldForType(schema[value.column].type) }
        </div> : null
    }
    {
      (value.column !== "" && value.operator !== "") ?
      <div className="w-[100px] bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none self-center" onClick={ () => { onAdd(value) } }>
        Add
      </div> : null
    }
  </div>
}