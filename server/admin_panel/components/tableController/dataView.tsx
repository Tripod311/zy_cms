import { useState, useEffect, useRef } from "react";
import Spinner from "../spinner";
import { DBTableObject, Filter, DBJSType } from "../../types";
import TableColumns from "./tableColumns";

const LIMIT = 10;

type Props = {
  tableName: string;
  filter: Filter;
  tableSchema: DBTableObject;
  forceUpdate: boolean;
  onSelect: (data: Record<string, DBJSType>) => void;
  selectedRow: Record<string, DBJSType>;
};

interface Location {
  offset: number;
  canGoForward: boolean;
}

export default function DataView ({ forceUpdate, tableName, tableSchema, filter, onSelect, selectedRow }: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState([]);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [location, setLocation] = useState<Location>({offset: 0, canGoForward: true});

  const cols = Object.keys(tableSchema);
  const [displayCols, setDisplayCols] = useState(cols.length > 3 ? cols.slice(0,3) : cols);

  const update = async () => {
    setError(null);
    setPending(true);
    onSelect(null);

    const response = await fetch("/admin/api/" + tableName, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fields: Object.keys(tableSchema).filter(fName => {
          // do not request blobs
          return tableSchema[fName].type !== "Uint8Array";
        }),
        where: filter,
        limit: LIMIT,
        offset: location.offset
      })
    });

    if (response.status === 200) {
      const data = await(response.json());
      setPending(false);
      if (data.error) {
        setError(data.error);
      } else {
        setRows(data.rows);
        setLocation({
          offset: location.offset,
          canGoForward: data.rows.length < LIMIT
        });
      }
    } else {
      const data = await(response.json());
      setPending(false);
      setError(data.error);
    }
  }

  const selectRow = (index) => {
    setSelectedRowIndex(index);
    onSelect(rows[index]);
  }

  useEffect(() => {
    if (!selectedRow) {
      setSelectedRowIndex(null);
    }
  }, [selectedRow]);

  const nextPage = () => {
    if (!location.canGoForward) return;

    setLocation({
      offset: location.offset + LIMIT,
      canGoForward: true
    });
    update();
  }

  const prevPage = () => {
    if (location.offset === 0) return;

    setLocation({
      offset: Math.max(0, location.offset - LIMIT),
      canGoForward: true
    });
    update();
  }

  useEffect(() => {
    const cols = Object.keys(tableSchema);
    setDisplayCols(cols.length > 3 ? cols.slice(0,3) : cols);
  }, [tableSchema]);

  useEffect(() => {
    setLocation({
      offset: 0,
      canGoForward: true
    });
    update();
  }, [filter, tableSchema]);

  useEffect(() => {
    if (forceUpdate) {
      update();
    }
  }, [forceUpdate]);

  if (pending) {
    return <Spinner />;
  } else if (error !== null) {
    return <div className="w-full h-full border border-red text-center flex flex-col justify-center items-center"><span>{error}</span></div>;
  } else {
    return <div className="w-full h-full overflow-auto relative">
      <TableColumns columns={Object.keys(tableSchema)} visible={displayCols} onChange={v => {setDisplayCols(v)}} />
      <div className="absolute w-full h-[40px] bottom-0 left-0 flex flex-row justify-between items-center p-2 border-t">
        <div className="cursor-pointer">⬅️ Backward</div>
        <div className="cursor-pointer">Forward ➡️</div>
      </div>
      <table className="min-w-full border border-gray-300 text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase h-[40px]">
          {
            displayCols.map(col => {
              return <th className="px-4 py-2 border-b border-gray-300 font-medium truncate" key={col}>{col}</th>
            })
          }
        </thead>
        <tbody>
          {
            rows.map((row, index) => {
              return <tr key={index} className={selectedRowIndex === index ? "h-[40px] bg-gray-200 cursor-pointer" : "h-[40px] hover:bg-gray-50 cursor-pointer"} onClick={() => {selectRow(index)}}>
                {
                  displayCols.map(col => {
                    return <td className="px-4 py-2 border-b border-gray-200 truncate" key={`${index}_${col}`}>{row[col] || "NULL"}</td>
                  })
                }
              </tr>
            })
          }
        </tbody>
      </table>
    </div>
  }
}