import { readFileSync } from "fs"
import yaml from "yaml";
import { DBConfig, DBSchema } from "./types";

import { DBDriver } from "./dbDrivers/driver";
import SqliteDriver from "./dbDrivers/sqlite";
import MysqlDriver from "./dbDrivers/mysql";
import PostgresDriver from "./dbDrivers/postgres";

class Database {
	private static instance: Database;
	private driver: DBDriver;

	private constructor (driver: DBDriver) {
		this.driver = driver;
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
		const raw = readFileSync('./schema.yaml', 'utf8');
	    const schema = yaml.parse(raw) as DBSchema;
	    
	    // build schema

	}
};

export default Database;