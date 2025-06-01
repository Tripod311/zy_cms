export type Operator<T> = {
  $eq?: T
  $ne?: T
  $in?: T[]
  $nin?: T[]
  $gt?: T
  $gte?: T
  $lt?: T
  $lte?: T
  $like?: string
}

export type WhereFilter<T> = {
  [K in keyof T]?: T[K] | Operator<T>
}

export interface CreateOptions<T = unknown> {
  returning?: boolean
}

type OrderByType<T> = keyof T | `${Extract<keyof T, string>} ASC` | `${Extract<keyof T, string>} DESC`;

export interface ReadOptions<T = unknown> {
  where?: Partial<T> | WhereFilter<T>
  fields?: (keyof T)[]
  orderBy?: OrderByType<T> | OrderByType<T>[]
  limit?: number
  offset?: number
  populate?: (keyof T)[]
}

export interface UpdateOptions<T = unknown> {
  returning?: boolean
  where?: Partial<T> | WhereFilter<T>
}

export interface DeleteOptions<T = unknown> {
  where?: Partial<T> | WhereFilter<T>
}

export interface DriverOptions {
  path?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export interface DBDriver {
  connect(options: DriverOptions): Promise<void>;

  create<T = unknown>(table: string, data: Partial<T>, options?: CreateOptions): Promise<void>;
  read<T = unknown>(table: string, options?: ReadOptions): Promise<T[]>;
  update<T = unknown>(table: string, data: Partial<T>, options?: UpdateOptions): Promise<void>;
  delete(table: string, options?: DeleteOptions): Promise<void>;

  query<T = unknown>(sql: string, params?: unknown[]): Promise<void>;
  queryWithResult<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
}