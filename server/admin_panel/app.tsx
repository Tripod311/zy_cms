import { useState, useEffect } from "react";
import Spinner from "./components/spinner";
import FirstLaunch from "./components/firstLaunch";
import LoginForm from "./components/loginForm";
import Dashboard from "./components/dashboard";

type AppState = "loading" | "firstLaunch" | "unauth" | "auth";

export default function Application () {
	const [state, setState] = useState<AppState>("loading");

	const verifyToken = async () => {
		const response = await fetch("/admin/api/verify");
		const result = await response.json() as { error: string | null };

		if (result.error) {
			setState("unauth");
		} else {
			setState("auth");
		}
	};

	const checkRoot = async () => {
		const response = await fetch("/admin/api/hasRoot");
		const result = await response.json();

		if (result) {
			verifyToken();
		} else {
			setState("firstLaunch");
		}
	};

	useEffect(() => {
		checkRoot();
	}, []);

	switch (state) {
		case "loading":
			return <Spinner />;
		case "firstLaunch":
			return <FirstLaunch onCreated={() => {setState("unauth")}} />;
		case "unauth":
			return <LoginForm onAuthorized={() => {setState("auth")}} />;
		case "auth":
			return <Dashboard />;
	}
}