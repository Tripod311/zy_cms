import Database from "better-sqlite3";
import { buildWhere, buildQueryTail } from "./sqlConstructor";
class SqliteDriver {
    async connect(options) {
        this.db = new Database(options.path);
    }
    async create(table, data, options) {
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
    async read(table, options) {
        let fieldsSql = "*";
        if (options?.fields) {
            fieldsSql = options.fields.join(", ");
        }
        let whereSql = "";
        let whereParams = [];
        if (options?.where) {
            const parsed = buildWhere(options.where);
            whereSql = parsed.sql;
            whereParams = parsed.params;
        }
        const sql = `SELECT ${fieldsSql} FROM ${table} ${whereSql} ${buildQueryTail(options)}`;
        const stmt = this.db.prepare(sql);
        const result = stmt.all(...whereParams);
        return result;
    }
    async update(table, data, options) {
        const fields = Object.keys(data);
        const params = Object.values(data);
        if (fields.length === 0) {
            throw new Error('No data provided for update');
        }
        const placeholders = fields.map((f) => `${f} = ?`).join(', ');
        let whereSql = "";
        let whereParams = [];
        if (options?.where) {
            const parsed = buildWhere(options.where);
            whereSql = parsed.sql;
            whereParams = parsed.params;
        }
        const sql = `UPDATE ${table} SET ${placeholders} ${whereSql}`;
        const stmt = this.db.prepare(sql);
        const result = stmt.run(...params, ...whereParams);
    }
    async delete(table, options) {
        let whereSql = "";
        let whereParams = [];
        if (options?.where) {
            const parsed = buildWhere(options.where);
            whereSql = parsed.sql;
            whereParams = parsed.params;
        }
        const sql = `DELETE FROM ${table} ${whereSql}`;
        const stmt = this.db.prepare(sql);
        const result = stmt.run(...whereParams);
    }
    async query(sql, params) {
        const request = this.db.prepare(sql);
        request.run(params);
    }
}
export default SqliteDriver;
