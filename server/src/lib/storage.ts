import fs from "fs";
import path from "path";
import { StorageFile } from "./types";
import DBProvider from "./db";

export default class StorageProvider {
  private static instance: StorageProvider | null;
  private basePath: string;

  public static async setup(basePath: string) {
    StorageProvider.instance = new StorageProvider(basePath);

    await DBProvider.getInstance().query(`CREATE TABLE IF NOT EXISTS media (
      alias VARCHAR(512) PRIMARY KEY,
      path VARCHAR(512)
    )`);
  }

  public static getInstance(): StorageProvider {
    if (StorageProvider.instance === null) throw new Error("Storage was not initialized");

    return StorageProvider.instance;
  }

  private constructor (basePath: string) {
    this.basePath = basePath;

    fs.mkdirSync(this.basePath, {recursive: true});
  }

  public async create (data: StorageFile) {
    const filePath = path.join(this.basePath, `${data.alias}_${(new Date()).toString()}.${data.extension || ''}`);

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
}