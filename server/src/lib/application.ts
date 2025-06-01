import { readFileSync } from 'fs'
import yaml from "yaml";
import { FastifyInstance } from "fastify";

import {AppConfig} from "./types";
import LocalizationProvider from "./localization";
import DBProvider from "./db";
import StorageProvider from "./storage";
import APIProvider from "./api";
import AuthProvider from "./auth";

export default class Application {
  public db: DBProvider | null = null;
  public storage: StorageProvider | null = null;
  public auth: AuthProvider | null = null;
  public api: FastifyInstance | null = null;
  public locales: LocalizationProvider | null = null;

  public async setup () {
    const raw = readFileSync('./config.yaml', 'utf8');
    const config = yaml.parse(raw) as AppConfig;
    
    if (config.localization.enable) {
      LocalizationProvider.setup(config.localization);
      this.locales = LocalizationProvider.getInstance();
    }

    await DBProvider.setup(config.db);
    this.db = DBProvider.getInstance();
    await APIProvider.setup(config.http);
    this.api = APIProvider.getInstance();

    if (config.storage.enable) {
      StorageProvider.setup(config.storage.path as string);
      this.storage = StorageProvider.getInstance();
    }

    if (config.auth.enable) {
      AuthProvider.setup(config.auth);
      this.auth = AuthProvider.getInstance();
    }
  }

  public start () {

  }

  public stop () {

  }
};