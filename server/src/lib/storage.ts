import fs from "fs";
import path from "path";
import mime from "mime-types";
import { FastifyRequest, FastifyReply } from "fastify";
import { StorageFile, StorageConfig } from "./types";
import DBProvider from "./db";
import APIProvider from "./api";
import AuthProvider from "./auth";

export default class StorageProvider {
  private static instance: StorageProvider | null;
  private basePath: string;

  public static async setup(config: StorageConfig) {
    StorageProvider.instance = new StorageProvider(config.path as string);

    await DBProvider.getInstance().query(`CREATE TABLE IF NOT EXISTS media (
      alias VARCHAR(512) PRIMARY KEY,
      path VARCHAR(512)
    )`);

    const app = APIProvider.getInstance();

    app.get("/storage/:alias", {
      preHandler: !config.publicGET ? [AuthProvider.getInstance().handlers.forceAuth] : [],
      handler: StorageProvider.instance.getByAlias.bind(StorageProvider.instance)
    });

    app.post("/storage/:alias", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: StorageProvider.instance.postByAlias.bind(StorageProvider.instance)
    });

    app.put("/storage/:alias", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: StorageProvider.instance.putByAlias.bind(StorageProvider.instance)
    });

    app.delete("/storage/:alias", {
      preHandler: [AuthProvider.getInstance().handlers.forceAuth],
      handler: StorageProvider.instance.deleteByAlias.bind(StorageProvider.instance)
    });
  }

  public static getInstance(): StorageProvider {
    if (StorageProvider.instance === null) throw new Error("Storage was not initialized");

    return StorageProvider.instance;
  }

  private constructor (basePath: string) {
    this.basePath = basePath;

    fs.mkdirSync(this.basePath, {recursive: true});
  }

  public async checkAliasTaken (alias: string) {
    const rows: StorageFile[] = await DBProvider.getInstance().read<StorageFile>("media", { where: {alias: alias} });

    return rows.length > 0;
  }

  public async create (data: StorageFile) {
    if (await this.checkAliasTaken(data.alias)) throw new Error(`Storage alias ${data.alias} already taken.`);

    const filePath = path.join(this.basePath, `${data.alias}_${(new Date()).toString()}${data.extension || ''}`);

    await fs.promises.writeFile(filePath, data.content as Buffer);
    await DBProvider.getInstance().create("media", {alias: data.alias, path: filePath});
  }

  public async read (data: StorageFile): Promise<string> {
    const rows: StorageFile[] = await DBProvider.getInstance().read<StorageFile>("media", { where: {alias: data.alias} });

    if (rows.length === 0) throw new Error(`Can't read ${data.alias}, no such file`);

    return rows[0].path as string;
  }

  public async update (data: StorageFile) {
    const rows: StorageFile[] = await DBProvider.getInstance().read<StorageFile>("media", { where: {alias: data.alias} });

    if (rows.length === 0) throw new Error(`Can't update ${data.alias}, no such file`);

    await fs.promises.unlink(rows[0].path as string);

    const filePath = path.join(this.basePath, `${data.alias}.${data.extension || ''}`);
    await fs.promises.writeFile(filePath, data.content as Buffer);
    await DBProvider.getInstance().update("media", {alias: data.alias, path: filePath});
  }

  public async delete (data: StorageFile) {
    const rows: StorageFile[] = await DBProvider.getInstance().read<StorageFile>("media", { where: {alias: data.alias} });

    if (rows.length === 0) throw new Error(`Can't delete ${data.alias}, no such file`);

    await fs.promises.unlink(rows[0].path as string);
    await DBProvider.getInstance().delete("media", {where: {alias: data.alias}});
  }

  public async getByAlias (request: FastifyRequest, reply: FastifyReply) {
    try {
      const fileOpts = request.params as StorageFile;
      const filePath = await this.read(fileOpts);

      const fileType = mime.lookup(filePath) || "application/octet-stream";

      const stream = fs.createReadStream(path.resolve(filePath));
      reply.header("Content-Type", fileType);

      return reply.send(stream);
    } catch (e) {
      if (e instanceof Error) {
        reply.code(404).send({ error: "Not found: " + e.toString() });
      } else {
        reply.code(404).send({ error: "Not found" });
      }
    }
  }

  public async postByAlias (request: FastifyRequest, reply: FastifyReply) {
    const { alias } = request.params as StorageFile;

    if (await this.checkAliasTaken(alias)) throw new Error(`Storage alias ${alias} already taken`);

    const fileInfo = await request.file();

    if (!fileInfo) {
      return reply.code(400).send({error: "No file uploaded"});
    }

    const { filename, file } = fileInfo;

    const filePath = path.join(this.basePath, `${alias}_${(new Date()).toString()}${path.extname(filename) || ''}`);
    const writeStream = fs.createWriteStream(filePath);

    try {
      await new Promise((resolve, reject) => {
        file.pipe(writeStream);
        file.on('end', resolve);
        file.on('error', reject);
      });

      reply.send({ error: null });
    } catch (err) {
      if (err instanceof Error) {
        reply.code(500).send({ error: 'Failed to save file: ' + err.toString() });
      } else {
        reply.code(500).send({ error: 'Uknown error' });
      }
    }
  }

  public async putByAlias (request: FastifyRequest, reply: FastifyReply) {
    const fileInfo = request.params as StorageFile;
    await this.delete(fileInfo);
    await this.postByAlias(request, reply);
  }

  public async deleteByAlias (request: FastifyRequest, reply: FastifyReply) {
    const fileInfo = request.params as StorageFile;
    await this.delete(fileInfo);

    reply.send({ error: null });
  }
}