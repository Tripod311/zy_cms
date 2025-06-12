import { readFileSync } from "fs"
import yaml from "yaml";
import { DBConfig, DBSchema, FieldSchema, ColumnField, RelationField, DBSchemaObject, DBTableObject, DBJSType, CreateOptions, ReadOptions, UpdateOptions, DeleteOptions } from "./types";
import LocalizationProvider from "./localization";

import { DBDriver, CreateTableOptions } from "./dbDrivers/driver";
import SqliteDriver from "./dbDrivers/sqlite";
import MysqlDriver from "./dbDrivers/mysql";
import PostgresDriver from "./dbDrivers/postgres";

class DBProvider {
  private static instance: DBProvider;
  private driver: DBDriver;
  public schema: DBSchemaObject = {};

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
    
    interface TableDescription {name: string; fields: string[]; relations: Set<string>;};

    let tableSchema: TableDescription[] = [];

    for (let i=0; i<schema.tables.length; i++) {
      const name = schema.tables[i].name;

      let relations: Set<string> = new Set();
      let fields: string[] = [];

      let tSchema: DBTableObject = {
        id: {
          defaultType: "INTEGER",
          type: "number"
        }
      };

      const addField = (name: string, type: string) => {
        switch (type) {
          case "markdown":
            tSchema[name] = {
              defaultType: "LONGTEXT",
              type: "markdown"
            };
            break;
          case "json":
            tSchema[name] = {
              defaultType: "LONGTEXT",
              type: "json"
            };
            break;
          case "datetime":
            tSchema[name] = {
              defaultType: "VARCHAR(30)",
              type: "datetime"
            };
            break;
          default:
            tSchema[name] = {
              defaultType: type,
              type: DBProvider.convertType(type)
            };
            break;
        }
      }

      schema.tables[i].fields.map((f: FieldSchema) => {
        if ('relation' in f) {
          addField(f.name, f.type);
          
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
              fields.push(`${f.name} ${tSchema[f.name].defaultType} UNIQUE REFERENCES ${f.relation.table}(${f.relation.column}) ${f.required ? "NOT NULL" : ""} ${onDeleteClause}`);
              break;
            case "many-to-one":
              fields.push(`${f.name} ${tSchema[f.name].defaultType} REFERENCES ${f.relation.table}(${f.relation.column}) ${f.required ? "NOT NULL" : ""} ${onDeleteClause}`);
              break;
          }

          const isStorageRef = storageEnabled && f.relation.table === "media";
          const isUsersRef = authEnabled && f.relation.table === "users";

          if (!(isStorageRef || isUsersRef)) relations.add(f.relation.table);
        } else {
          if (f.localized) {
            for (let locale of LocalizationProvider.getInstance().locales) {
              addField(`${f.name}_${locale}`, f.type);
              fields.push(`${f.name}_${locale} ${tSchema[`${f.name}_${locale}`].defaultType} ${f.required ? "NOT NULL" : ""} ${f.unique ? "UNIQUE" : ""}`);
            }
          } else {
            addField(f.name, f.type);
            fields.push(`${f.name} ${tSchema[f.name].defaultType} ${f.required ? "NOT NULL" : ""} ${f.unique ? "UNIQUE" : ""}`);
          }
        }
      });

      tableSchema.push({
        name: name,
        fields: fields,
        relations: relations
      });
      DBProvider.extendSchema(name, tSchema);
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

      await DBProvider.instance.createTable({
        name: selectedTable.name,
        fields: selectedTable.fields
      });
      tableSchema.splice(selectedTableIndex, 1);
      for (let i=0; i<tableSchema.length; i++) {
        tableSchema[i].relations.delete(selectedTable.name);
      }
    }
  }

  public static extendSchema (name: string, table: DBTableObject) {
    DBProvider.instance.schema[name] = table;
  }

  public static fieldsOf<T>(...keys: (keyof T)[]): (keyof T)[] {
    return keys;
  }

  private static convertType (sqlType: string): DBJSType {
    sqlType = sqlType.toLowerCase().trim();

    if (sqlType.startsWith("tinyint(1)") || sqlType.startsWith("bool")) return "boolean";

    if (sqlType.startsWith("integer") ||
      sqlType.startsWith("int") ||
      sqlType.startsWith("smallint") ||
      sqlType.startsWith("mediumint") ||
      sqlType.startsWith("bigint") ||
      sqlType.startsWith("real") ||
      sqlType.startsWith("float") || 
      sqlType.startsWith("double") ||
      sqlType.startsWith("tinyint")) {
      return "number";
    }

    if (sqlType.startsWith("blob") ||
      sqlType.startsWith("tinyblob") ||
      sqlType.startsWith("mediumblob") ||
      sqlType.startsWith("longblob") ||
      sqlType.startsWith("binary") ||
      sqlType.startsWith("varbinary")) {
      return "Uint8Array";
    }
      
    return "string";
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

  async createTable(options: CreateTableOptions) {
    await this.driver.createTable(options);
  }
};

export default DBProvider;