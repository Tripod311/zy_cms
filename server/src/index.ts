import Application from "./lib/application"

const app = new Application();

function shutdown () {
	app.stop();
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

app.setup().then(() => {
	app.start().then(() => {
		console.log("Application started");
	})
});