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
  credentials: null | {
    key: string;
    cert: string;
    ca?: string;
  }
  cors?: string[];
}

export interface StorageConfig {
  enable: boolean;
  path?: string;
}

export interface AuthConfig {
  enable: boolean;
  jwt_secret?: string;
  cookie_secret?: string;
  roles?: string[];
}

export interface LocalizationConfig {
  enable: boolean;
  locales?: string[];
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
  name: string
  type: string
  required?: boolean
  unique?: boolean
  localized?: boolean
}

export interface RelationField {
  name: string
  relation: {
    table: string
    kind: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
    onDelete?: 'cascade' | 'setNull' | 'restrict' | 'noAction' | 'setDefault'
    onUpdate?: 'cascade' | 'setNull' | 'restrict' | 'noAction' | 'setDefault'
    required?: boolean
    populate?: boolean
  }
}

export type FieldSchema = ColumnField | RelationField

export interface TableSchema {
  name: string
  fields: FieldSchema[]
}

export interface DBSchema {
  tables: TableSchema[]
}