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
  publicGET?: boolean;
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
  
  admin_panel: boolean;
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

export interface User {
  id?: number;
  login: string;
  password?: string;
}

export type DBJSType = 'string' | 'markdown' | 'json' | 'datetime' | 'number' | 'Uint8Array' | 'boolean';
export type DBTableObject = Record<string, {
  defaultType: string;
  type: DBJSType;
}>;
export type DBSchemaObject = Record<string, DBTableObject>;

// database types

export type Operator<T> = {
  $eq?: T;
  $ne?: T;
  $in?: T[];
  $nin?: T[];
  $gt?: T;
  $gte?: T;
  $lt?: T;
  $lte?: T;
  $like?: string;
}

export type WhereFilter<T> = {
  [K in keyof T]?: T[K] | Operator<T>;
}

export interface CreateOptions<T = unknown> {
  returning?: boolean;
}

type OrderByType<T> = keyof T | `${Extract<keyof T, string>} ASC` | `${Extract<keyof T, string>} DESC`;

export interface ReadOptions<T = unknown> {
  where?: Partial<T> | WhereFilter<T>;
  fields?: (keyof T)[];
  orderBy?: OrderByType<T> | OrderByType<T>[];
  limit?: number;
  offset?: number;
}

export interface UpdateOptions<T = unknown> {
  returning?: boolean;
  where?: Partial<T> | WhereFilter<T>;
}

export interface DeleteOptions<T = unknown> {
  where?: Partial<T> | WhereFilter<T>;
}