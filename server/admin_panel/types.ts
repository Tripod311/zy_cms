export type DBJSType = 'string' | 'richText' | 'number' | 'Uint8Array' | 'boolean';

export type DBTableObject = Record<string, {
  defaultType: string;
  type: DBJSType;
}>;

export type DBSchemaObject = Record<string, DBTableObject>;