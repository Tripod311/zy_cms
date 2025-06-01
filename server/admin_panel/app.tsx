import { useState } from "react";
import Spinner from "./components/spinner";

export default function Application () {
	const [loaded, setLoaded] = useState(false);
	const [authorized, setAuthorized] = useState(false);

	if (!loaded) {
		return <Spinner />;
	} else {
		return "DICK";
	}
}