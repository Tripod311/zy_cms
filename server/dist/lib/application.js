import { readFileSync } from 'fs';
import yaml from "yaml";
import LocalizationProvider from "./localization";
import DBProvider from "./db";
import StorageProvider from "./storage";
export default class Application {
    async launch() {
        const raw = readFileSync('./config.yaml', 'utf8');
        const config = yaml.parse(raw);
        if (config.localization.enable) {
            LocalizationProvider.setup(config.localization);
        }
        await DBProvider.setup(config.db);
        if (config.storage.enable) {
            StorageProvider.setup(config.storage.path);
        }
    }
}
;
