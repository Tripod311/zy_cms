import { useState, useEffect, useRef } from "react";
import Spinner from "./spinner";
import Cross from "../images/cancel.svg";
import Plus from "../images/plus.svg";

const LIMIT = 10;

interface Location {
  offset: number;
  canGoForward: boolean;
  changed: boolean;
}

export default function MediaTableController () {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pending, setPending] = useState<boolean>(false);
  const pendingAction = useRef<Promise<void> | null>(null);

  const [data, setData] = useState([]);
  const [location, setLocation] = useState({ offset: 0, canGoForward: true, changed: true });
  const [selectedFile, setSelectedFile] = useState<number | null>(null);

  const fileInput = useRef<HTMLElement>(null);
  const replaceFileInput = useRef<HTMLElement>(null);
  const [aliasValue, setAliasValue] = useState<string>("");

  const update = async () => {
    const response = await fetch("/storage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        offset: location.offset,
        limit: LIMIT,
        orderBy: ["id"]
      })
    });

    const responseData = await response.json();

    setLoading(false);
    if (response.ok) {
      setData(responseData.data);
      setLocation({
        offset: location.offset,
        canGoForward: responseData.data.length === LIMIT
      });
    } else {
      setError(responseData.error);
    }
  }

  const nextPage = () => {
    if (!location.canGoForward) return;

    setSelectedFile(null);

    setLocation({
      offset: location.offset + LIMIT,
      canGoForward: true,
      changed: true
    });
  }

  const prevPage = () => {
    if (location.offset === 0) return;

    setSelectedFile(null);

    setLocation({
      offset: Math.max(0, location.offset - LIMIT),
      canGoForward: true,
      changed: true
    });
  }

  useEffect(() => {
    if (location.changed) {
      setLocation({
        offset: location.offset,
        canGoForward: location.canGoForward,
        changed: false
      });
      update();
    }
  }, [location]);

  const triggerFileInput = () => {
    if (aliasValue.trim().length === 0) {
      setError("Define alias for file first");
      return;
    }

    fileInput.current.click();
  }

  const fileInputChange = (e) => {
    if (e.target.files.length > 0) {
      setPending(true);
      pendingAction.current = async () => {
        setError(null);
        setPending(false);
        setLoading(true);

        const data = new FormData();
        data.append("file", e.target.files[0]);

        const response = await fetch(`/storage/${aliasValue}`, {
          method: "POST",
          body: data
        });

        const responseData = await response.json();

        if (response.ok) {
          await update();
        } else {
          setError(responseData.error);
        }

        setLoading(false);
      }
    }
  }

  const openSelected = () => {
    window.open(`/storage/${data[selectedFile].alias}`, "_blank");
  }

  const replaceSelected = () => {
    replaceFileInput.current.click();
  }

  const replaceFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      setPending(true);
      pendingAction.current = async () => {
        setError(null);
        setPending(false);
        setLoading(true);
        setSelectedFile(null);

        const data = new FormData();
        data.append("file", e.target.files[0]);

        const response = await fetch(`/storage/${aliasValue}`, {
          method: "PUT",
          body: data
        });

        const responseData = await response.json();

        if (response.ok) {
          await update();
        } else {
          setError(responseData.error);
        }

        setLoading(false);
      }
    }
  }

  const deleteSelected = () => {
    setPending(true);
    pendingAction.current = async () => {
      setError(null);
      setPending(false);
      setLoading(true);
      setSelectedFile(null);

      const response = await fetch(`/storage/${data[selectedFile].alias}`, {
        method: "DELETE"
      });

      const responseData = await response.json();

      if (response.ok) {
        await update();
      } else {
        setError(responseData.error);
      }

      setLoading(false);
    }
  }

  if (loading) {
    return <Spinner />
  } else {
    return <div className="w-full h-full overflow-hidden relative flex flex-col">
      <input ref={fileInput} type="file" className="hidden" onChange={fileInputChange} />
      <input ref={replaceFileInput} type="file" className="hidden" onChange={replaceFileInputChange} />
      <div className="w-full flex flex-row gap-2 items-center p-2 border-box flex-wrap">
        <img src={Plus} className="w-[30px] h-[30px] cursor-pointer" onClick={triggerFileInput} />
        <input type="text" value={aliasValue} onChange={e => { setAliasValue(e.target.value) }} className="p-2 rounded border" style={aliasValue.trim().length === 0 ? {borderColor: "red"} : {}} placeholder="Alias for upload" />
        {
          selectedFile !== null ? <>
            <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none whitespace-nowrap" onClick={openSelected}>
              Open selected
            </div>
            <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none whitespace-nowrap" onClick={replaceSelected}>
              Replace selected
            </div>
            <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer select-none whitespace-nowrap" onClick={deleteSelected}>
              Delete selected
            </div>
          </>: null
        }
      </div>
      <div className="w-full h-full overflow-y-auto pb-[40px] border-box">
        <div className="w-full flex flex-col">
          {
            data.map((f, index) => {
              return <div key={index} className={selectedFile === index ? "bg-gray-200 cursor-pointer p-2 text-xl border-b" : "hover:bg-gray-50 cursor-pointer p-2 text-xl border-b"} onClick={() => { setSelectedFile(index) }}>
                {f.alias}
              </div>
            })
          }
        </div>
        <div className="absolute w-full h-[40px] bottom-0 left-0 flex flex-row justify-between items-center p-2 border-t">
          <div className="cursor-pointer" onClick={prevPage}>⬅️ Backward</div>
          <div className="cursor-pointer" onClick={nextPage}>Forward ➡️</div>
        </div>
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
        error ? <div className="bg-white absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center z-20">
          <img src={Cross} className="w-[30px] h-[30px] absolute top-[5px] right-[5px] cursor-pointer" onClick={(e) => {setError(null)}} />
          <div className="text-xl">Error: {error}</div>
        </div> : null
      }
    </div>
  }
}