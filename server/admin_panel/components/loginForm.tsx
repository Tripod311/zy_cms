import { useState } from "react";
import Spinner from "./spinner";

type Props = {
  onAuthorized: () => void;
}

export default function LoginForm ({ onAuthorized }: Props) {
  const [pending, setPending] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [login, setLogin] = useState<string>("");
  const [pwd, setPwd] = useState<string>("");

  const tryLogin = async () => {
    if (pending) return;

    setError(null);
    setPending(true);

    const response = await fetch("/admin/api/authorize", {
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
      onAuthorized();
    }
  };

  return <div className="w-full h-full flex flex-col items-center justify-center">
    {pending ? <div className="absolute top-[100px] w-[150px] h-[150px] p-2 rounded-xl border border-blue-500"><Spinner /></div> : null}
    {error !== null ? <div className="absolute top-[100px] max-w-[300px] p-2 rounded-xl border border-red-500">{error}</div> : null}
    <div className="max-w-[300px] p-2 shadow-xl rounded-xl flex flex-col gap-2 border border-black items-center">
      <span className="text-xl text-center">Sign in</span>
      <input type="text" className="p-2 rounded border" value={login} onChange={e => {setLogin(e.target.value)}} placeholder="Login" />
      <input type="password" className="p-2 rounded border" value={pwd} onChange={e => {setPwd(e.target.value)}} placeholder="Password" />
      <div className="bg-slate-500 hover:bg-slate-600 p-2 text-white rounded cursor-pointer" onClick={tryLogin}>
        Submit
      </div>
    </div>
  </div>
}