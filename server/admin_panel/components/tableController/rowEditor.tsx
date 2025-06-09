import { useState, useEffect } from "react";
import { Row, DBTableObject } from "../../types";

import StringInput from "./rowInputs/string";
import NumberInput from "./rowInputs/number";
import BooleanInput from "./rowInputs/boolean";
import DateInput from "./rowInputs/datetime";
import TextInput from "./rowInputs/text";
import JSONInput from "./rowInputs/json";
import MarkdownInput from "./rowInputs/markdown";

type Props = {
  tableSchema: DBTableObject;
  data?: Row;
  addRow: (data: Row) => void;
  updateRow: (data: Row) => void;
  deleteRow: (data: Row) => void;
}

export default function RowEditor ({ tableSchema, data, addRow, updateRow, deleteRow }: Props) {
  const fillValue = (): Row => {
    if (data === null) {
      let v = {};
      for (let i in tableSchema) {
        switch (tableSchema[i].type) {
          case "string":
          case "json":
          case "markdown":
            v[i] = "";
            break;
          case "number":
            v[i] = 0;
            break;
          case "boolean":
            v[i] = false;
            break;
          case "datetime":
            v[i] = (new Date()).toISOString();
            break;
        }
      }
      return v;
    } else {
      return data;
    }
  }

  const [value, setValue] = useState<Row>(fillValue());

  useEffect(() => {
    setValue(fillValue());
  }, [tableSchema, data]);

  const inputChanged = (fieldName, fieldValue) => {
    const nv = Object.assign({}, value);
    nv[fieldName] = fieldValue;
    setValue(nv);
  };

  const onAdd = () => {
    addRow(value);
  }

  const onUpdate = () => {
    updateRow(value);
  }

  const onDelete = () => {
    addRow(value);
  }

  return <div className="w-full p-2 flex flex-col gap-2">
    {
      Object.keys(tableSchema).map(fieldName => {
        const field = tableSchema[fieldName];

        if (fieldName === "id") return null;

        switch (field.type) {
          case "string":
            if (field.defaultType.toLowerCase().startsWith("text") || field.defaultType.toLowerCase().startsWith("mediumtext") || field.defaultType.toLowerCase().startsWith("longtext")) {
              return <TextInput key={fieldName} title={fieldName} value={value[fieldName]} onChange={(v) => {inputChanged(fieldName, v)}} />
            } else {
              return <StringInput key={fieldName} title={fieldName} value={value[fieldName]} onChange={(v) => {inputChanged(fieldName, v)}} />
            }
          case "number":
            return <NumberInput key={fieldName} title={fieldName} value={value[fieldName]} onChange={(v) => {inputChanged(fieldName, v)}} />
          case "boolean":
            return <BooleanInput key={fieldName} title={fieldName} value={value[fieldName]} onChange={(v) => {inputChanged(fieldName, v)}} />
          case "datetime":
            return <DateInput key={fieldName} title={fieldName} value={value[fieldName]} onChange={(v) => {inputChanged(fieldName, v)}} />
          case "json":
            return <JSONInput key={fieldName} title={fieldName} id={value.id} value={value[fieldName]} onChange={(v) => {inputChanged(fieldName, v)}} />
          case "markdown":
            return <MarkdownInput key={fieldName} title={fieldName} id={value.id} value={value[fieldName]} onChange={(v) => {inputChanged(fieldName, v)}} />
          case "Uint8Array":
          default:
            return null;
        }
      })
    }
    <div className="flex flex-row gap-2">
      <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none" onClick={onAdd}>
        Add as new row
      </div>
      {
        value.id ? 
        <>
          <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none" onClick={onUpdate}>
            Update selected row
          </div>
          <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none" onClick={onDelete}>
            Delete selected row
          </div>
        </>
        : null
      }
    </div>
  </div>
}