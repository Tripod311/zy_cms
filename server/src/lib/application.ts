import { readFileSync } from 'fs'
import yaml from "yaml";

import Database from "./db";
import LocalizationProvider from "./localization";
import {AppConfig} from "./types";

export default class Application {
  public async launch () {
    const raw = readFileSync('./config.yaml', 'utf8');
    const config = yaml.parse(raw) as AppConfig;
    
    if (config.localization.enable) {
      LocalizationProvider.setup(config.localization);
    }

    await Database.setup(config.db);
  }
};