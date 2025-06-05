import { useState, useEffect } from "react";
import Spinner from "./spinner";
import { DBSchemaObject } from "../types";

export default function Dashboard () {
	const [schema, setSchema] = useState<DBSchemaObject | null>(null);
	const [error, setError] = useState<string | null>(null);

	const onStart = async () => {
		const response = await fetch("/admin/api/schema");
		if (response.status !== 200) {
			const errorMsg = await response.json() as {error: string};
			setError(errorMsg.error);
		} else {
			const data = await response.json() as DBSchemaObject;
			setSchema(data);
		}
	}

	useEffect(onStart, []);

	if (error === null && schema === null) {
		return <Spinner />;
	} else if (error !== null) {
		return <div className="w-full h-full flex flex-col justify-center items-center">
			<div className="p-4 border border-red-500 text-xl">{error}</div>
		</div>;
	} else {
		return <div>LOADED</div>;
	}
};