export type TableDefaults = {
  id: number;
  created: string;
  updated: string;
};
export type TableDTO<T> = Omit<T, keyof TableDefaults>;
export type Changes = {
  changes: number;
  lastInsertRowid: number | bigint;
};
export type DBDataTypes = string | number | Uint8Array | null;
export type DBRow = Record<string, DBDataTypes>;
