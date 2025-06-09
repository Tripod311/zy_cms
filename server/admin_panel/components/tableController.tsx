import { useState, useEffect } from "react";
import Spinner from "./spinner";
import Foldable from "./tableController/foldable";
import DataView from "./tableController/dataView";
import FilterView from "./tableController/filterView";
import RowEditor from "./tableController/rowEditor";
import { DBTableObject, Filter, Row, DBJSType } from "../types";

type Props = {
  tableName: string;
  tableSchema: DBTableObject;
};

export default function TableController ({ tableName, tableSchema }: Props) {
  const [filterValue, setFilterValue] = useState<Filter>({});
  const [selectedRow, setSelectedRow] = useState<Row>(null);
  const [pending, setPending] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<() => Promise<void> | null>(null);

  useEffect(() => {
    setFilterValue({});
    setSelectedRow(null);
    setPending(false);
    setPendingAction(null);
  }, [tableName]);

  const addRow = (data: Record<string,DBJSType>) => {

  }

  const updateRow = (data: Record<string,DBJSType>) => {

  }

  const deleteRow = (data: Record<string,DBJSType>) => {

  }

  return <div className="w-full overflow-y-auto">
    {
      tableName === "media" ? <span>MEDIA</span> :
      <>
        <Foldable title="Filter" fold={true}>
          <FilterView tableSchema={tableSchema} onChange={(fv) => {setFilterValue(fv)}} />
        </Foldable>
        <div className="relative w-full h-[480px] border">
            <DataView tableName={tableName} tableSchema={tableSchema} filter={filterValue} selectedRow={selectedRow} onSelect={(data) => {setSelectedRow(data)}} />
        </div>
        <RowEditor
          tableSchema={tableSchema}
          data={selectedRow || null}
          addRow={addRow}
          updateRow={updateRow}
          deleteRow={deleteRow}
        />
      </>
    }
    {
      pending ? 
      <div className="absolute top-0 left-0 w-full flex flex-col justify-center items-center">
        <div className="p-4 flex flex-col items-center gap-2">
          <span className="text-xl font-bold">Confirm action</span>
          <div className="flex flex-row justify-between">
            <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none" onClick={pendingAction}>
              Ok
            </div>
            <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none" onClick={() => { setPendingAction(null); setPending(false); }}>
              Cancel
            </div>
          </div>
        </div>
      </div> : null
    }
  </div>
}