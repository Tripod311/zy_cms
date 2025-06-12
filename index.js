import path from "path";
import Application from "./dist/application.js";
import FastifyStatic from "@fastify/static";

const app = new Application();

async function start () {
  await app.setup();
  await app.start();
}

function stop () {
  (async () => {
    await app.stop();
  })();
}

process.on("SIGINT", stop);
process.on("SIGTERM", stop);

start();