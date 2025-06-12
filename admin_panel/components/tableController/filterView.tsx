import { useState, useEffect, useRef } from "react";
import { DBTableObject, Filter, DBJSType, FilterField, OutFilter, OutFilterField } from "../../types";
import TextInput from "./filterInputs/text";
import NumberInput from "./filterInputs/number";
import DateInput from "./filterInputs/date";
import SwitchInput from "./filterInputs/switch";

type Props = {
  initialValue: Filter;
  tableSchema: DBTableObject;
  onChange: (f: Filter) => void;
}

export default function FilterView ({ initialValue, tableSchema, onChange }: Props) {
  const [value, setValue] = useState<Filter>(initialValue || {});
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    setValue({});
  }, [tableSchema]);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      let outValue: OutFilterField = {};

      for (let i in value) {
        if (value[i].type === 'none') continue;
        outValue[i] = {};
        outValue[i]["$"+value[i].type] = value[i].value;
      }

      onChange(outValue);
    }, 200);
  }, [value]);

  useEffect(() => {
    return () => {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const formFieldChange = (k, v) => {
    const nv = Object.assign({}, value);
    nv[k] = v;
    setValue(nv);
  }

  return <div className="flex flex-col gap-2">
    {
      Object.keys(tableSchema).map(key => {
        const field = tableSchema[key];

        switch (field.type) {
          case "string":
            return <TextInput key={key} title={key} value={value[key]} onChange={v => { formFieldChange(key, v) }} />
          case "number":
            return <NumberInput key={key} title={key} value={value[key]} onChange={v => { formFieldChange(key, v) }} />
          case "datetime":
            return <DateInput key={key} title={key} value={value[key]} onChange={v => { formFieldChange(key, v) }} />
          case "boolean":
            return <SwichInput key={key} title={key} value={value[key]} onChange={v => { formFieldChange(key, v) }} />
          default:
            return null;
        }
      })
    }
  </div>
}