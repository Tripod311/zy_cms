import { readFileSync } from "fs";
import yaml from "yaml";
import SqliteDriver from "./dbDrivers/sqlite";
import MysqlDriver from "./dbDrivers/mysql";
import PostgresDriver from "./dbDrivers/postgres";
class Database {
    constructor(driver) {
        this.driver = driver;
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
        const raw = readFileSync('./schema.yaml', 'utf8');
        const schema = yaml.parse(raw);
        // build schema
    }
}
;
export default Database;
