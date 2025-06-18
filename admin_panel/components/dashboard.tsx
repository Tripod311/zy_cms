import { useState, useEffect } from "react";
import Spinner from "./spinner";
import Overlay from "./overlay";
import SchemaTree from "./schemaTree";
import TableController from "./tableController";
import MediaTableController from "./mediaTableController";
import { DBSchemaObject } from "../types";

export default function Dashboard () {
  const [schema, setSchema] = useState<DBSchemaObject | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [table, setSelectedTable] = useState<string | null>(null);

  const onSelect = (tname: string) => {
    setSelectedTable(tname);
  }

  const reloadSchema = async () => {
    setError(null);
    setSchema(null);

    const response = await fetch("/admin/api/schema");
    if (response.status !== 200) {
      const errorMsg = await response.json() as {error: string};
      setError(errorMsg.error);
    } else {
      const data = await response.json() as DBSchemaObject;
      setSchema(data);
    }
  }

  const renderTableControls = () => {
    if (table === null) return null;

    if (table === "media") return <MediaTableController />
    
    return <TableController tableName={table} tableSchema={schema[table]} />;
  }

  useEffect(reloadSchema, []);

  if (error === null && schema === null) {
    return <Spinner />;
  } else if (error !== null) {
    return <div className="w-full h-full flex flex-col justify-center items-center">
      <div className="p-4 border border-red-500 text-xl">{error}</div>
    </div>;
  } else {
    return <>
      <div className="w-full h-full relative border-box overflow-hidden pt-[50px] flex flex-row">
        <div className="w-[300px] h-full hidden md:block">
          <SchemaTree schema={schema} onSelected={onSelect} />
        </div>
        { renderTableControls() }
      </div>
      <Overlay schema={schema} onSelected={onSelect} />
    </>
  }
};