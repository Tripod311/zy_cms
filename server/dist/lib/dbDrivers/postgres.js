import { Client } from 'pg';
import { buildWhere, buildQueryTail } from './sqlConstructor';
class PostgresDriver {
    async connect(options) {
        this.client = new Client(options);
        await this.client.connect();
    }
    async create(table, data) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        if (fields.length === 0) {
            throw new Error('No data provided for insert');
        }
        const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO "${table}" (${fields.map(f => `"${f}"`).join(', ')}) VALUES (${placeholders})`;
        await this.client.query(sql, values);
    }
    async read(table, options) {
        let fieldsSql = '*';
        if (options?.fields) {
            fieldsSql = options.fields.map(f => `"${f}"`).join(', ');
        }
        let whereSql = '';
        let whereParams = [];
        if (options?.where) {
            const parsed = buildWhere(options.where);
            whereSql = parsed.sql;
            whereParams = parsed.params;
        }
        const sql = `SELECT ${fieldsSql} FROM "${table}"${whereSql ? ' ' + whereSql : ''}${buildQueryTail(options)}`;
        const result = await this.client.query(sql, whereParams);
        return result.rows;
    }
    async update(table, data, options) {
        const fields = Object.keys(data);
        const values = Object.values(data);
        if (fields.length === 0) {
            throw new Error('No data provided for update');
        }
        const setClause = fields.map((f, i) => `"${f}" = $${i + 1}`).join(', ');
        let whereSql = '';
        let whereParams = [];
        if (options?.where) {
            const parsed = buildWhere(options.where);
            whereSql = parsed.sql;
            whereParams = parsed.params;
        }
        const sql = `UPDATE "${table}" SET ${setClause}${whereSql ? ' ' + whereSql : ''}`;
        await this.client.query(sql, [...values, ...whereParams]);
    }
    async delete(table, options) {
        let whereSql = '';
        let whereParams = [];
        if (options?.where) {
            const parsed = buildWhere(options.where);
            whereSql = parsed.sql;
            whereParams = parsed.params;
        }
        const sql = `DELETE FROM "${table}"${whereSql ? ' ' + whereSql : ''}`;
        await this.client.query(sql, whereParams);
    }
    async query(sql, params) {
        const result = await this.client.query(sql, params ?? []);
    }
}
export default PostgresDriver;
