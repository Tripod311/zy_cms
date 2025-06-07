import { useState, useEffect } from "react";
import Spinner from "./spinner";
import Foldable from "./tableController/foldable";
import DataView from "./tableController/dataView";
import FilterView from "./tableController/filterView";
import { DBTableObject, Filter } from "../types";

type Props = {
  tableName: string;
  tableSchema: DBTableObject;
};

export default function TableController ({ tableName, tableSchema }: Props) {
  return <div className="w-full overflow-y-auto">
    {
      tableName === "media" ? <span>MEDIA</span> :
      <>
        <Foldable title="Filter" fold={true}>
          <FilterView tableSchema={tableSchema} />
        </Foldable>
        <div className="relative w-full h-[480px] border">
            <DataView tableName={tableName} tableSchema={tableSchema} filter={{}} onSelect={(data) => {console.log(data)}} />
        </div>
      </>
    }
  </div>
}