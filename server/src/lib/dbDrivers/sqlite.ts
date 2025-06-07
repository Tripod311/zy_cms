import { mkdirSync } from "fs";
import path from "path";
import Database, { Database as DatabaseType } from "better-sqlite3";
import { DBDriver, CreateTableOptions } from "./driver";
import { CreateOptions, ReadOptions, UpdateOptions, DeleteOptions } from "../types";
import { buildWhere, buildQueryTail } from "./sqlConstructor";

class SqliteDriver implements DBDriver {
  private db!: DatabaseType;

  async connect(options: {path: string}): Promise<void> {
    mkdirSync(path.dirname(options.path), {recursive: true});

    this.db = new Database(options.path);
  }

  async disconnect () {
    this.db.close();
  }

  async create<T = unknown>(table: string, data: Partial<T>, options?: CreateOptions<T>): Promise<void> {
    const fields = Object.keys(data);
    const params = Object.values(data);

    if (fields.length === 0) {
      throw new Error('No data provided for insert');
    }

    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`;

    const stmt = this.db.prepare(sql);
    const result = stmt.run(...params);
  }

  async read<T = unknown>(table: string, options?: ReadOptions<T>): Promise<T[]> {
    let fieldsSql = "*";

    if (options?.fields) {
      fieldsSql = options.fields.join(", ");
    }

    let whereSql = "";
    let whereParams: unknown[] = [];

    if (options?.where) {
      const parsed = buildWhere(options.where);
      whereSql = parsed.sql;
      whereParams = parsed.params;
    }

    const sql = `SELECT ${fieldsSql} FROM ${table} ${whereSql} ${buildQueryTail(options)}`;

    const stmt = this.db.prepare(sql);
    const result = stmt.all(...whereParams) as T[];
    return result;
  }

  async update<T = unknown>(table: string, data: Partial<T>, options?: UpdateOptions<T>): Promise<void> {
    const fields = Object.keys(data);
    const params = Object.values(data);

    if (fields.length === 0) {
      throw new Error('No data provided for update');
    }

    const placeholders = fields.map((f) => `${f} = ?`).join(', ');

    let whereSql = "";
    let whereParams: unknown[] = [];

    if (options?.where) {
      const parsed = buildWhere(options.where);
      whereSql = parsed.sql;
      whereParams = parsed.params;
    }

    const sql = `UPDATE ${table} SET ${placeholders} ${whereSql}`;

    const stmt = this.db.prepare(sql);
    const result = stmt.run(...params, ...whereParams);
  }

  async delete<T = unknown>(table: string, options?: DeleteOptions<T>): Promise<void> {
    let whereSql = "";
    let whereParams: unknown[] = [];

    if (options?.where) {
      const parsed = buildWhere(options.where);
      whereSql = parsed.sql;
      whereParams = parsed.params;
    }

    const sql = `DELETE FROM ${table} ${whereSql}`;

    const stmt = this.db.prepare(sql);
    const result = stmt.run(...whereParams);
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<void> {
    const request = this.db.prepare(sql);
    if (Array.isArray(params)) {
      request.run(...params);
    } else {
      request.run();
    }
  }

  async queryWithResult<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const stmt = this.db.prepare(sql);
    if (params !== undefined) {
      const result = stmt.all(...params) as T[];
      return result;
    } else {
      const result = stmt.all() as T[];
      return result;
    }
  }

  async createTable(options: CreateTableOptions): Promise<void> {
    const fieldsSql = "id INTEGER PRIMARY KEY AUTOINCREMENT, " + options.fields.join(', ');
    const stmt = this.db.prepare(`CREATE TABLE IF NOT EXISTS ${options.name} (${fieldsSql})`);
    stmt.run();
  }
}

export default SqliteDriver