import { readFileSync } from "fs"
import yaml from "yaml";
import { DBConfig, DBSchema, FieldSchema, ColumnField, RelationField, DBSchemaObject, DBTableObject, DBJSType, CreateOptions, ReadOptions, UpdateOptions, DeleteOptions } from "./types";
import LocalizationProvider from "./localization";

import { DBDriver } from "./dbDrivers/driver";
import SqliteDriver from "./dbDrivers/sqlite";
import MysqlDriver from "./dbDrivers/mysql";
import PostgresDriver from "./dbDrivers/postgres";

class DBProvider {
  private static instance: DBProvider;
  private driver: DBDriver;
  public schema!: DBSchemaObject;

  private constructor (driver: DBDriver) {
    this.driver = driver;
  }

  public static getInstance(): DBProvider {
    return DBProvider.instance;
  }

  public static async setup (config: DBConfig) {
    let driver: DBDriver;
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

  public static async buildSchema (storageEnabled: boolean, authEnabled: boolean) {
    const raw = readFileSync('./schema.yaml', 'utf8');
    const schema = yaml.parse(raw) as DBSchema;
    
    interface TableDescription {name: string; sql: string; relations: Set<string>;};

    let tableSchema: TableDescription[] = [];
    let inSchema: DBSchemaObject = {};

    for (let i=0; i<schema.tables.length; i++) {
      const name = schema.tables[i].name;

      let relations: Set<string> = new Set();
      let fields: string[] = [];

      inSchema[name] = {};

      schema.tables[i].fields.map((f: FieldSchema) => {
        inSchema[name][f.name] = {
          defaultType: f.type === "richText" ? "LONGTEXT" : f.type,
          type: DBProvider.convertType(f.type)
        };

        if ('relation' in f) {
          let onDeleteClause: string = "";

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
              fields.push(`${f.name} ${inSchema[name][f.name].defaultType} UNIQUE REFERENCES ${f.relation.table}(${f.relation.column}) ${f.required ? "NOT NULL" : ""} ${onDeleteClause}`);
              break;
            case "many-to-one":
              fields.push(`${f.name} ${inSchema[name][f.name].defaultType} REFERENCES ${f.relation.table}(${f.relation.column}) ${f.required ? "NOT NULL" : ""} ${onDeleteClause}`);
              break;
          }

          const isStorageRef = storageEnabled && f.relation.table === "media";
          const isUsersRef = authEnabled && f.relation.table === "users";

          if (!(isStorageRef || isUsersRef)) relations.add(f.relation.table);
        } else {
          if (f.localized) {
            for (let locale of LocalizationProvider.getInstance().locales) {
              fields.push(`${f.name}_${locale} ${inSchema[name][f.name].defaultType} ${f.required ? "NOT NULL" : ""} ${f.unique ? "UNIQUE" : ""}`);
            }
          } else {
            fields.push(`${f.name} ${inSchema[name][f.name].defaultType} ${f.required ? "NOT NULL" : ""} ${f.unique ? "UNIQUE" : ""}`);
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
      let selectedTable: TableDescription | null = null;
      let selectedTableIndex: number = -1;

      for (let i=0; i<tableSchema.length; i++) {
        if (tableSchema[i].relations.size === 0) {
          selectedTable = tableSchema[i];
          selectedTableIndex = i;
          break;
        }
      }

      if (selectedTable === null) throw new Error("Circular dependency in DB schema");

      await DBProvider.instance.query(`CREATE TABLE IF NOT EXISTS ${selectedTable.name} (${selectedTable.sql})`);
      tableSchema.splice(selectedTableIndex, 1);
      for (let i=0; i<tableSchema.length; i++) {
        tableSchema[i].relations.delete(selectedTable.name);
      }
    }

    DBProvider.instance.schema = inSchema;
  }

  public static fieldsOf<T>(...keys: (keyof T)[]): (keyof T)[] {
    return keys;
  }

  private static convertType (sqlType: string): DBJSType {
    sqlType = sqlType.toLowerCase();

    if (sqlType.startsWith("richtext")) return "richText";

    if (sqlType.startsWith("varchar")) return "string";

    if (sqlType.startsWith("binary") || sqlType.startsWith("varbinary")) return "Uint8Array";

    if (sqlType.startsWith("decimal") || sqlType.startsWith("numeric")) return "string";

    if (sqlType.startsWith("float") || sqlType.startsWith("double") || sqlType.startsWith("tinyint")) return "number";

    switch (sqlType) {
      case "integer":
      case "int":
      case "smallint":
      case "mediumint":
      case "bigint":
      case "real":
        return "number";
      case "blob":
      case "tinyblob":
      case "mediumblob":
      case "longblob":
        return "Uint8Array";
      case "bool":
      case "boolean":
        return "boolean";
      default:
        return "string";
    }
  }

  public async disconnect () {
    await this.driver.disconnect();
  }

  async create<T = unknown>(table: string, data: Partial<T>, options?: CreateOptions<T>): Promise<void> {
    await this.driver.create<T>(table, data, options);
  }

  async read<T = unknown>(table: string, options?: ReadOptions<T>): Promise<T[]> {
    return this.driver.read<T>(table, options);
  }

  async update<T = unknown>(table: string, data: Partial<T>, options?: UpdateOptions<T>): Promise<void> {
    await this.driver.update<T>(table, data, options);
  }

  async delete<T = unknown>(table: string, options?: DeleteOptions<T>): Promise<void> {
    await this.driver.delete(table, options);
  }

  async query (sql: string, params?: unknown[]): Promise<void> {
    await this.driver.query(sql, params);
  }

  async queryWithResult<T = unknown>(sql: string, params?: unknown[]): Promise<T[]> {
    return this.driver.queryWithResult<T>(sql, params);
  }
};

export default DBProvider;