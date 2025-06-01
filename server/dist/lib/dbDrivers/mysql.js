import mysql from 'mysql2/promise';
import { buildWhere, buildQueryTail } from './sqlConstructor';
class MysqlDriver {
    async connect(options) {
        this.connection = await mysql.createConnection(options);
    }
    async create(table, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        if (fields.length === 0) {
            throw new Error('No data provided for insert');
        }
        const placeholders = fields.map(() => '?').join(', ');
        const sql = `INSERT INTO \`${table}\` (${fields.map(f => `\`${f}\``).join(', ')}) VALUES (${placeholders})`;
        await this.connection.execute(sql, values);
    }
    async read(table, options) {
        let fieldsSql = '*';
        if (options?.fields) {
            fieldsSql = options.fields.map(f => `\`${f}\``).join(', ');
        }
        let whereSql = '';
        let whereParams = [];
        if (options?.where) {
            const parsed = buildWhere(options.where);
            whereSql = parsed.sql;
            whereParams = parsed.params;
        }
        const sql = `SELECT ${fieldsSql} FROM \`${table}\`${whereSql ? ' ' + whereSql : ''}${buildQueryTail(options)}`;
        const [rows] = await this.connection.execute(sql, whereParams);
        return rows;
    }
    async update(table, data, options) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        if (fields.length === 0) {
            throw new Error('No data provided for update');
        }
        const setClause = fields.map(f => `\`${f}\` = ?`).join(', ');
        let whereSql = '';
        let whereParams = [];
        if (options?.where) {
            const parsed = buildWhere(options.where);
            whereSql = parsed.sql;
            whereParams = parsed.params;
        }
        const sql = `UPDATE \`${table}\` SET ${setClause}${whereSql ? ' ' + whereSql : ''}`;
        await this.connection.execute(sql, [...values, ...whereParams]);
    }
    async delete(table, options) {
        let whereSql = '';
        let whereParams = [];
        if (options?.where) {
            const parsed = buildWhere(options.where);
            whereSql = parsed.sql;
            whereParams = parsed.params;
        }
        const sql = `DELETE FROM \`${table}\`${whereSql ? ' ' + whereSql : ''}`;
        await this.connection.execute(sql, whereParams);
    }
    async query(sql, params) {
        const [rows] = await this.connection.execute(sql, params ?? []);
    }
    async queryWithResult(sql, params) {
        const [rows] = await this.connection.execute(sql, params);
        return rows;
    }
}
export default MysqlDriver;
