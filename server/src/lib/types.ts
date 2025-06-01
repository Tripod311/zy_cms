import 'fastify';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      login: string;
    };
  }
}

export interface DBConfig {
  type: 'sqlite' | 'postgres' | 'mysql';
  path?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export interface HTTPConfig {
  admin_port: number;
  port: number;
  cookie_secret?: string;
  credentials: null | {
    key: string;
    cert: string;
    ca?: string;
  }
  cors?: {
    origin: string[];
    methods: string[];
  }
}

export interface StorageConfig {
  enable: boolean;
  path?: string;
}

export interface AuthConfig {
  enable: boolean;
  jwt_secret?: string;
  secure_cookies?: boolean;
}

export interface LocalizationConfig {
  enable: boolean;
  locales: string[];
  fallbackLocale: string;
}

export interface AppConfig {
  storage: StorageConfig;
  db: DBConfig;
  http: HTTPConfig;
  auth: AuthConfig;
  localization: LocalizationConfig;
}

export interface ColumnField {
  name: string;
  type: string;
  required?: boolean;
  unique?: boolean;
  localized?: boolean;
}

export interface RelationField {
  name: string;
  type: string;
  required?: boolean;
  relation: {
    table: string;
    column: string;
    kind: 'one-to-one' | 'many-to-one';
    onDelete?: 'cascade' | 'setNull' | 'restrict' | 'noAction' | 'setDefault';
  }
}

export type FieldSchema = ColumnField | RelationField;

export interface TableSchema {
  name: string;
  fields: FieldSchema[];
}

export interface DBSchema {
  tables: TableSchema[];
}

export interface StorageFile {
  alias: string;
  extension?: string;
  path?: string;
  content?: Buffer;
}