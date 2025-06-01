import { readFileSync } from "fs";
import yaml from "yaml";
import LocalizationProvider from "./localization";
import SqliteDriver from "./dbDrivers/sqlite";
import MysqlDriver from "./dbDrivers/mysql";
import PostgresDriver from "./dbDrivers/postgres";
class DBProvider {
    constructor(driver) {
        this.driver = driver;
    }
    static getInstance() {
        return DBProvider.instance;
    }
    static async setup(config) {
        let driver;
        switch (config.type) {
            case "sqlite":
                driver = new SqliteDriver();
                break;
            case "mysql":
                driver = new MysqlDriver();
                break;
            case "postgres":
                driver = new PostgresDriver();
                break;
            default:
                throw new Error(`Invalid database driver name: ${config.type}. Possible values: sqlite, mysql, postgres`);
        }
        await driver.connect(config);
        if (config.type === "sqlite") {
            await driver.query("PRAGMA foreign_keys = ON");
        }
        DBProvider.instance = new DBProvider(driver);
    }
    static async buildSchema() {
        const raw = readFileSync('./schema.yaml', 'utf8');
        const schema = yaml.parse(raw);
        ;
        let tableSchema = [];
        for (let i = 0; i < schema.tables.length; i++) {
            const name = schema.tables[i].name;
            let relations = new Set();
            let fields = [];
            schema.tables[i].fields.map((f) => {
                if ('relation' in f) {
                    let onDeleteClause = "";
                    switch (f.relation.onDelete) {
                        case "cascade":
                            onDeleteClause = "ON DELETE CASCADE";
                            break;
                        case "setNull":
                            onDeleteClause = "ON DELETE SET NULL";
                            break;
                        case "restrict":
                            onDeleteClause = "ON DELETE RESTRICT";
                            break;
                        case "noAction":
                            onDeleteClause = "ON DELETE NO ACTION";
                            break;
                        case "setDefault":
                            onDeleteClause = "ON DELETE SET DEFAULT";
                            break;
                    }
                    switch (f.relation.kind) {
                        case "one-to-one":
                            fields.push(`${f.name} ${f.type} UNIQUE REFERENCES ${f.relation.table}(${f.relation.column}) ${f.required ? "NOT NULL" : ""} ${onDeleteClause}`);
                            break;
                        case "many-to-one":
                            fields.push(`${f.name} ${f.type} REFERENCES ${f.relation.table}(${f.relation.column}) ${f.required ? "NOT NULL" : ""} ${onDeleteClause}`);
                            break;
                    }
                    relations.add(f.relation.table);
                }
                else {
                    if (f.localized) {
                        for (let locale of LocalizationProvider.getInstance().locales) {
                            fields.push(`${f.name}.${locale} ${f.type} ${f.required ? "NOT NULL" : ""} ${f.unique ? "UNIQUE" : ""}`);
                        }
                    }
                    else {
                        fields.push(`${f.name} ${f.type} ${f.required ? "NOT NULL" : ""} ${f.unique ? "UNIQUE" : ""}`);
                    }
                }
            });
            tableSchema.push({
                name: name,
                sql: fields.join(", "),
                relations: relations
            });
        }
        while (tableSchema.length > 0) {
            let selectedTable = null;
            let selectedTableIndex = -1;
            for (let i = 0; i < tableSchema.length; i++) {
                if (tableSchema[i].relations.size === 0) {
                    selectedTable = tableSchema[i];
                    selectedTableIndex = i;
                    break;
                }
            }
            if (selectedTable === null)
                throw new Error("Circular dependency in DB schema");
            await DBProvider.instance.query(`CREATE TABLE IF NOT EXISTS ${selectedTable.name} (${selectedTable.sql})`);
            tableSchema.splice(selectedTableIndex, 1);
            for (let i = 0; i < tableSchema.length; i++) {
                tableSchema[i].relations.delete(selectedTable.name);
            }
        }
    }
    async create(table, data, options) {
        await this.driver.create(table, data, options);
    }
    async read(table, options) {
        return this.driver.read(table, options);
    }
    async update(table, data, options) {
        await this.driver.update(table, data, options);
    }
    async delete(table, options) {
        await this.driver.delete(table, options);
    }
    async query(sql, params) {
        await this.driver.query(sql, params);
    }
    async queryWithResult(sql, params) {
        return this.driver.queryWithResult(sql, params);
    }
}
;
export default DBProvider;
