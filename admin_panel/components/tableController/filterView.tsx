import { useState, useEffect } from "react";
import Cancel from "../../images/cancel.svg";
import Search from "../../images/search.svg";
import { DBTableObject, Filter, DBJSType, FilterField, OutFilter, OutFilterField } from "../../types";
import BlockCreator, {BlockCreatorValue} from "./blockCreator";

export default function FilterView ({ tableSchema, onChange }: Props) {
  const [value, setValue] = useState<BlockCreatorValue[]>([]);
  const [showBlockCreator, setShowBlockCreator] = useState(false);

  useEffect(() => {
    setValue([]);
  }, [tableSchema]);

  useEffect(() => {
    const result: Filter = {};

    for (let i=0; i<value.length; i++) {
      const block = value[i];

      if (!result[block.column]) result[block.column] = {};

      result[block.column]['$' + block.operator] = block.value;
    }
    
    onChange(result);
  }, [value]);

  const deleteBlock = (index) => {
    setShowBlockCreator(false);
    const nv = value.slice();
    nv.splice(index, 1);
    setValue(nv);
  }

  const addBlock = (v: BlockCreatorValue) => {
    setShowBlockCreator(false);
    const nv = value.slice();
    nv.push(v);
    setValue(nv);
  }

  return <div className="w-full flex flex-row p-2 gap-2 relative">
    <img src={Search} className="w-[20px] h-[20px] cursor-pointer" title="Filter" onClick={() => { setShowBlockCreator(!showBlockCreator); }} />
    {
      value.map((block, index) => {
        let content = [];

        content.push(block.column);
        switch (block.operator) {
          case "like":
            content.push("LIKE");
            break;
          case "lt":
            content.push("<");
            break;
          case "gt":
            content.push(">");
            break;
          case "lte":
            content.push("<=");
            break;
          case "gte":
            content.push(">=");
            break;
          case "eq":
            content.push("=");
            break;
          case "ne":
            content.push("!=");
            break;
          default:
            console.log(`Unknown operator: ${block.operator}`);
            return null;
        }
        content.push(block.value);

        return <div key={index} className="p-2 border border-sky-700 bg-sky-200 rounded flex flex-row items-center gap-2">
          <span>{content.join(' ')}</span>
          <img src={Cancel} className="w-[20px] h-[20px] cursor-pointer" onClick={() => {deleteBlock(index)}}/>
        </div>
      })
    }
    {
      showBlockCreator ? <BlockCreator schema={tableSchema} onAdd={addBlock} /> : null
    }
  </div>
}