import { useState, useEffect } from "react";
import { DBTableObject, Filter, DBJSType, FilterField } from "../../types";
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

  useEffect(() => {
    setValue({});
  }, [tableSchema]);

  const formFieldChange = (k, v) => {
    const nv = Object.assign({}, value);
    nv[k] = v;
    setValue(nv);
  }

  return <div className="flex flex-col gap-2">
    {
      Object.keys(tableSchema).map(key => {
        const field = tableSchema[key];
        console.log(field);

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