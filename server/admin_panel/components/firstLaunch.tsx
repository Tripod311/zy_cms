import { useState } from "react";
import Spinner from "./spinner";

type Props = {
  onCreated: () => void;
}

export default function FirstLaunch ({ onCreated }: Props) {
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState<string>("");
  const [pwd, setPwd] = useState<string>("");
  const [pwdRepeat, setPwdRepeat] = useState<string>("");

  const tryCreate = async () => {
    if (pending) return;

    if (login.trim().length === 0 || pwd.trim().length === 0) {
      setError("Login and password can't be empty");
      return;
    }

    if (pwd !== pwdRepeat) {
      setError("Passwords doesn't match");
      return;
    }

    setError(null);
    setPending(true);

    const response = await fetch("/admin/api/createRoot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login: login.trim(),
        password: pwd.trim()
      })
    });
    const data = await response.json() as { error: string | null };

    setPending(false);

    if (data.error) {
      setError(data.error);
    } else {
      onCreated();
    }
  };

  return <div className="w-full h-full flex flex-col items-center justify-center">
    {pending ? <div className="absolute top-[100px] w-[150px] h-[150px] p-2 rounded-xl border border-blue-500"><Spinner /></div> : null}
    {error !== null ? <div className="absolute top-[100px] max-w-[300px] p-2 rounded-xl border border-red-500">{error}</div> : null}
    <div className="max-w-[300px] p-2 shadow-xl rounded-xl flex flex-col gap-2 border border-black items-center">
      <span className="text-xl text-center">Create first user:</span>
      <input type="text" className="p-2 rounded border" value={login} onChange={e => {setLogin(e.target.value)}} placeholder="Login" />
      <input type="password" className="p-2 rounded border" value={pwd} onChange={e => {setPwd(e.target.value)}} placeholder="Password" />
      <input type="password" className="p-2 rounded border" value={pwdRepeat} onChange={e => {setPwdRepeat(e.target.value)}} placeholder="Repeat password" />
      <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer" onClick={tryCreate}>
        Submit
      </div>
    </div>
  </div>
}