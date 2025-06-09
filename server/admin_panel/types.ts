export type DBJSType = 'string' | 'markdown' | 'json' | 'datetime' | 'number' | 'Uint8Array' | 'boolean';

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

export type OutFilterField<T> = {
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

export type OutFilter<T> = {
  [key in keyof T]?: OutFilterField<T[key]>;
}

export type RowFieldType = string | number | boolean;

export type Row = Record<string, RowFieldType>;