import fs from "fs";
import path from "path";
import DBProvider from "./db";
export default class StorageProvider {
    static async setup(basePath) {
        StorageProvider.instance = new StorageProvider(basePath);
        await DBProvider.getInstance().query(`CREATE TABLE IF NOT EXISTS media (
      alias VARCHAR(512) PRIMARY KEY,
      path VARCHAR(512)
    )`);
    }
    static getInstance() {
        if (StorageProvider.instance === null)
            throw new Error("Storage was not initialized");
        return StorageProvider.instance;
    }
    constructor(basePath) {
        this.basePath = basePath;
        fs.mkdirSync(this.basePath, { recursive: true });
    }
    async create(data) {
        const filePath = path.join(this.basePath, `${data.alias}.${data.extension || ''}`);
        await fs.promises.writeFile(filePath, data.content);
        await DBProvider.getInstance().create("media", { alias: data.alias, path: filePath });
    }
    async read(data) {
        const rows = await DBProvider.getInstance().read("media", { where: { alias: data.alias } });
        if (rows.length === 0)
            throw new Error(`Can't read ${data.alias}, no such file`);
        return rows[0].path;
    }
    async update(data) {
        const rows = await DBProvider.getInstance().read("media", { where: { alias: data.alias } });
        if (rows.length === 0)
            throw new Error(`Can't update ${data.alias}, no such file`);
        await fs.promises.unlink(rows[0].path);
        const filePath = path.join(this.basePath, `${data.alias}.${data.extension || ''}`);
        await fs.promises.writeFile(filePath, data.content);
        await DBProvider.getInstance().update("media", { alias: data.alias, path: filePath });
    }
    async delete(data) {
        const rows = await DBProvider.getInstance().read("media", { where: { alias: data.alias } });
        if (rows.length === 0)
            throw new Error(`Can't delete ${data.alias}, no such file`);
        await fs.promises.unlink(rows[0].path);
        await DBProvider.getInstance().delete("media", { where: { alias: data.alias } });
    }
}
