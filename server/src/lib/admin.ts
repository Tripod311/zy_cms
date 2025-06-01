import { existsSync, unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import FastifyStatic from "@fastify/static";
import APIProvider from "./api";
import AuthProvider from "./auth";
import DBProvider from "./db";
import LocalizationProvider from "./localization";

export default class AdminPanel {
  public static async setup () {
    const app = APIProvider.getInstance();

    const __dirname = path.dirname(fileURLToPath(import.meta.url));

    await app.register(FastifyStatic, {
      root: path.join(__dirname, "admin_panel_dist"),
      prefix: "/admin"
    });

    // create first user
    app.post("/admin/api/hasRoot", {
      handler: (request, reply) => {
        return existsSync("./firstLaunch");
      }
    });

    app.post("/admin/api/createRoot", {
      handler: async (request, reply) => {
        if (existsSync("./firstLaunch")) {
          try {
            const body = request.body as {login: string, password: string};

            await AuthProvider.getInstance().create(body.login, body.password);
            unlinkSync("./firstLaunch");

            reply.send({ error: null });
          } catch (e) {
            if (e instanceof Error) {
              reply.status(500).send({ error: e.toString() });
            } else {
              reply.status(500).send({ error: "Unknown error" });
            }
          }
        } else {
          reply.status(403).send({ error: "Not allowed" });
        }
      }
    });

    // authorize
    app.post("/admin/api/authorize", {
      handler: async (request, reply) => {
        await AuthProvider.getInstance().authorize(request, reply);

        reply.send({ error: null });
      }
    });
  }
}