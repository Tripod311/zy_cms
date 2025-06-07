export type DBJSType = 'string' | 'richText' | 'datetime' | 'number' | 'Uint8Array' | 'boolean';

export type DBTableObject = Record<string, {
  defaultType: string;
  type: DBJSType;
}>;

export type DBSchemaObject = Record<string, DBTableObject>;

export type FilterField<T> = { type: 'lt' | 'lte' | 'gt' | 'gte' | 'eq' | 'ne'; value: T } |
  { type: 'in' | 'nin'; value: T[]; } |
  { type: 'like'; value: string; };

export type Filter<T> = {
  [key in keyof T]?: FilterField<T[key]>;
};