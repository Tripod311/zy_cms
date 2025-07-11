import { existsSync, unlinkSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import FastifyStatic from "@fastify/static";
import APIProvider from "./api";
import AuthProvider from "./auth";
import DBProvider from "./db";
import LocalizationProvider from "./localization";

import { User, CreateOptions, ReadOptions, UpdateOptions, DeleteOptions } from "./types";


function getAdminPanelPath () {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.join(__dirname, '../admin_panel_dist');
}

export default class AdminPanel {
  public static async setup () {
    const app = APIProvider.getInstance();

    await app.register(FastifyStatic, {
      root: getAdminPanelPath(),
      prefix: "/admin",
      index: ["index.html"],
      decorateReply: false
    });

    // create first user
    app.get("/admin/api/hasRoot", {
      handler: (request, reply) => {
        return !existsSync("./firstLaunch");
      }
    });

    app.post("/admin/api/createRoot", {
      handler: async (request, reply) => {
        if (existsSync("./firstLaunch")) {
          try {
            const body = request.body as User;

            await AuthProvider.getInstance().create(body.login, body.password as string);
            unlinkSync("./firstLaunch");

            reply.send({ error: null });
          } catch (e) {
            if (e instanceof Error) {
              reply.code(500).send({ error: e.toString() });
            } else {
              reply.code(500).send({ error: "Unknown error" });
            }
          }
        } else {
          reply.code(403).send({ error: "Not allowed" });
        }
      }
    });

    // authorize and verify
    app.post("/admin/api/authorize", {
      handler: async (request, reply) => {
        await AuthProvider.getInstance().authorize(request, reply);

        reply.send({ error: null });
      }
    });

    app.post("/admin/api/logout", {
      handler: async (request, reply) => {
        AuthProvider.getInstance().logout(request, reply);

        reply.send({ error: null });
      }
    });

    app.get("/admin/api/verify", {
      preHandler: [AuthProvider.getInstance().handlers.checkAuth],
      handler: (request, reply) => {
        if (request.user) {
          reply.send({ error: null });
        } else {
          reply.send({ error: "Token expired" });
        }
      }
    });

    // users
    app.post("/admin/api/users", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: async (request, reply) => {
        const rows = await DBProvider.getInstance().read<User>('users', request.body as ReadOptions);
        reply.send({
          error: false,
          rows: rows
        });
      }
    });

    app.post("/admin/api/users/new", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: async (request, reply) => {
        const body = request.body as User;

        await AuthProvider.getInstance().create(body.login, body.password as string);

        reply.send({ error: false });
      }
    });

    app.put("/admin/api/users/:id", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: async (request, reply) => {
        const { id } = request.params as { id: number; };
        const rows = await DBProvider.getInstance().read<User>("users", {fields: ["login"], where: {id: id}});
        if (rows.length === 0) {
          reply.code(404).send({ error: "User not found" });
        } else {
          const { login, password } = request.body as User;

          await AuthProvider.getInstance().update(login, password as string);

          reply.send({ error: false });
        }
      }
    });

    app.delete("/admin/api/users/:id", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: async (request, reply) => {
        const { id } = request.params as { id: number; };
        const rows = await DBProvider.getInstance().read<User>("users", {fields: ["login"], where: {id: id}});

        if (rows.length === 0) {
          reply.send({ error: false });
        } else {
          const login = rows[0].login;

          if (login === request.user?.login) {
            reply.code(500).send({
              error: "User can't delete himself"
            });
          } else {
            await AuthProvider.getInstance().delete(login);

            reply.send({ error: false });
          }
        }
      }
    });

    // data manipulations
    app.get("/admin/api/schema", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: async (request, reply) => {
        reply.send(DBProvider.getInstance().schema);
      }
    });

    // using post here, because
    app.post("/admin/api/:table", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: async (request, reply) => {
        const { table } = request.params as { table: string; };
        const schema = DBProvider.getInstance().schema;
        const readOptions = request.body as ReadOptions;

        if (!(table in schema)) {
          reply.code(500).send({
            error: `Unknown table ${table}`
          });
        } else {
          reply.send({
            error: false,
            rows: await DBProvider.getInstance().read(table, readOptions)
          });
        }
      }
    });

    app.post("/admin/api/:table/new", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: async (request, reply) => {
        const { table } = request.params as { table: string; };
        const schema = DBProvider.getInstance().schema;

        if (!(table in schema)) {
          reply.code(500).send({
            error: `Unknown table ${table}`
          });
        } else {
          await DBProvider.getInstance().create(table, request.body as Partial<unknown>);
          reply.send({
            error: false
          });
        }
      }
    });

    app.put("/admin/api/:table/:id", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: async (request, reply) => {
        const { table, id } = request.params as { table: string; id: number; };
        const schema = DBProvider.getInstance().schema;
        const data = request.body as Partial<unknown>;

        if (!(table in schema)) {
          reply.code(500).send({
            error: `Unknown table ${table}`
          });
        } else {
          await DBProvider.getInstance().update(table, data, { where: { id: id } });
          reply.send({
            error: false
          });
        }
      }
    });

    app.delete("/admin/api/:table/:id", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: async (request, reply) => {
        const { table, id } = request.params as { table: string; id: number; };
        const schema = DBProvider.getInstance().schema;

        if (!(table in schema)) {
          reply.code(500).send({
            error: `Unknown table ${table}`
          });
        } else {
          await DBProvider.getInstance().delete(table, { where: { id: id } });
          reply.send({
            error: false
          });
        }
      }
    });
  }
}