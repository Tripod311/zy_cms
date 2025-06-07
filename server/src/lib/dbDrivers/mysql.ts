import mysql from 'mysql2/promise';
import { DBDriver, CreateTableOptions } from "./driver";
import { CreateOptions, ReadOptions, UpdateOptions, DeleteOptions } from "../types";
import { buildWhere, buildQueryTail } from './sqlConstructor';

class MysqlDriver implements DBDriver {
  private connection!: mysql.Connection;

  async connect(options: { host: string; port: number; user: string; password: string; database: string }): Promise<void> {
    this.connection = await mysql.createConnection(options);
  }

  async disconnect () {
    this.connection.end();
  }

  async create<T = unknown>(table: string, data: Partial<T>): Promise<void> {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      throw new Error('No data provided for insert');
    }

    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO \`${table}\` (${fields.map(f => `\`${f}\``).join(', ')}) VALUES (${placeholders})`;

    await this.connection.execute(sql, values);
  }

  async read<T = unknown>(table: string, options?: ReadOptions<T>): Promise<T[]> {
    let fieldsSql = '*';

    if (options?.fields) {
      fieldsSql = options.fields.map(f => `\`${f as string}\``).join(', ');
    }

    let whereSql = '';
    let whereParams: unknown[] = [];

    if (options?.where) {
      const parsed = buildWhere(options.where);
      whereSql = parsed.sql;
      whereParams = parsed.params;
    }

    const sql = `SELECT ${fieldsSql} FROM \`${table}\`${whereSql ? ' ' + whereSql : ''}${buildQueryTail(options)}`;
    const [rows] = await this.connection.execute(sql, whereParams);
    return rows as T[];
  }

  async update<T = unknown>(table: string, data: Partial<T>, options?: UpdateOptions<T>): Promise<void> {
    const fields = Object.keys(data);
    const values = Object.values(data);

    if (fields.length === 0) {
      throw new Error('No data provided for update');
    }

    const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');

    let whereSql = '';
    let whereParams: unknown[] = [];

    if (options?.where) {
      const parsed = buildWhere(options.where);
      whereSql = parsed.sql;
      whereParams = parsed.params;
    }

    const sql = `UPDATE \`${table}\` SET ${setClause}${whereSql ? ' ' + whereSql : ''}`;
    await this.connection.execute(sql, [...values, ...whereParams]);
  }

  async delete<T = unknown>(table: string, options?: DeleteOptions<T>): Promise<void> {
    let whereSql = '';
    let whereParams: unknown[] = [];

    if (options?.where) {
      const parsed = buildWhere(options.where);
      whereSql = parsed.sql;
      whereParams = parsed.params;
    }

    const sql = `DELETE FROM \`${table}\`${whereSql ? ' ' + whereSql : ''}`;
    await this.connection.execute(sql, whereParams);
  }

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<void> {
    const [rows] = await this.connection.execute(sql, params ?? []);
  }

  async queryWithResult<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    const [rows] = await this.connection.execute(sql, params);
    return rows as T[];
  }

  async createTable(options: CreateTableOptions): Promise<void> {
    const fieldsSql = "id INT PRIMARY KEY AUTO_INCREMENT, " + options.fields.join(', ');
    await this.connection.execute(`CREATE TABLE IF NOT EXISTS ${options.name} (${fieldsSql})`);
  }
}

export default MysqlDriver;