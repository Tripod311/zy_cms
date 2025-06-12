import { useState, useEffect, useRef } from "react";
import Spinner from "./spinner";
import Foldable from "./tableController/foldable";
import DataView from "./tableController/dataView";
import FilterView from "./tableController/filterView";
import RowEditor from "./tableController/rowEditor";
import { DBTableObject, Filter, Row, DBJSType } from "../types";

import Cross from "../images/cancel.svg";

type Props = {
  tableName: string;
  tableSchema: DBTableObject;
};

export default function TableController ({ tableName, tableSchema }: Props) {
  const [filterValue, setFilterValue] = useState<Filter>({});
  const [selectedRow, setSelectedRow] = useState<Row>(null);
  const [pending, setPending] = useState<boolean>(false);
  const pendingAction = useRef<Promise<void> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [forceUpdate, setForceUpdate] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFilterValue({});
    setSelectedRow(null);
    setPending(false);
    pendingAction.current = null;
  }, [tableName]);

  const addRow = (data: Record<string,DBJSType>) => {
    setPending(true);
    pendingAction.current = async () => {
      setPending(false);
      pendingAction.current = null;
      setLoading(true);

      const response = await fetch(`/admin/api/${tableName}/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      setLoading(false);

      if (!response.ok) {
        setError(responseData.error);
      }

      setForceUpdate(true);
    };
  }

  const updateRow = (data: Record<string,DBJSType>) => {
    setPending(true);
    pendingAction.current = async () => {
      setSelectedRow(null);
      setPending(false);
      pendingAction.current = null;
      setLoading(true);

      const response = await fetch(`/admin/api/${tableName}/${data.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const responseData = await response.json();

      setLoading(false);

      if (!response.ok) {
        setError(responseData.error);
      }

      setForceUpdate(true);
    };
  }

  const deleteRow = (data: Record<string,DBJSType>) => {
    setPending(true);
    pendingAction.current = async () => {
      setSelectedRow(null);
      setPending(false);
      pendingAction.current = null;
      setLoading(true);

      const response = await fetch(`/admin/api/${tableName}/${data.id}`, {
        method: "DELETE"
      });

      const responseData = await response.json();

      setLoading(false);

      if (!response.ok) {
        setError(responseData.error);
      }

      setForceUpdate(true);
    };
  }

  useEffect(() => {
    setForceUpdate(false);
  }, [forceUpdate]);

  return <div className="w-full overflow-hidden relative">
    <div className="w-full h-full overflow-y-auto relative">
      <Foldable title="Filter" fold={true}>
        <FilterView tableSchema={tableSchema} onChange={(fv) => {setFilterValue(fv)}} />
      </Foldable>
      <div className="relative w-full h-[480px] border">
          <DataView forceUpdate={forceUpdate} tableName={tableName} tableSchema={tableSchema} filter={filterValue} selectedRow={selectedRow} onSelect={(data) => {setSelectedRow(data)}} />
      </div>
      <RowEditor
        forceUpdate={forceUpdate}
        tableSchema={tableSchema}
        data={selectedRow || null}
        addRow={addRow}
        updateRow={updateRow}
        deleteRow={deleteRow}
      />
    </div>
    {
      pending ? 
      <div className="absolute top-0 left-0 w-full h-full bg-white flex flex-col justify-center items-center">
        <div className="p-4 w-[250px] flex flex-col items-center gap-2 text-center">
          <span className="text-xl font-bold">Confirm action</span>
          <div className="w-full flex flex-row justify-between">
            <div className="w-[100px] bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none" onClick={() => {pendingAction.current()}}>
              Ok
            </div>
            <div className="w-[100px] bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none" onClick={() => { pendingAction.current = null; setPending(false); }}>
              Cancel
            </div>
          </div>
        </div>
      </div> : null
    }
    {
      loading ? <div className="absolute top-0 left-0 w-full h-full"><Spinner /></div> : null
    }
    {
      error ? <div className="bg-white absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-20">
        <img src={Cross} className="w-[30px] h-[30px] absolute top-[5px] right-[5px] cursor-pointer" onClick={(e) => {setError(null)}} />
        <div className="text-xl">Error: {error}</div>
      </div> : null
    }
  </div>
}