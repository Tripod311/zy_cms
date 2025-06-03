import { Operator, WhereFilter, CreateOptions, ReadOptions, UpdateOptions, DeleteOptions } from "../types";

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
  disconnect(): Promise<void>;

  create<T = unknown>(table: string, data: Partial<T>, options?: CreateOptions<T>): Promise<void>;
  read<T = unknown>(table: string, options?: ReadOptions<T>): Promise<T[]>;
  update<T = unknown>(table: string, data: Partial<T>, options?: UpdateOptions<T>): Promise<void>;
  delete<T = unknown>(table: string, options?: DeleteOptions<T>): Promise<void>;

  query<T = unknown>(sql: string, params?: unknown[]): Promise<void>;
  queryWithResult<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
}