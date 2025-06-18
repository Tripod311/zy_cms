import { WhereFilter, Operator, ReadOptions } from "../types"

export function buildWhere<T = unknown>(filter: WhereFilter<T>, driverType: 'sqlite' | 'mysql' | 'postgres' ): { sql: string, params: unknown[] } {
  const clauses: string[] = [];
  const params: unknown[] = [];

  let counter = 1;

  function getPlaceholder () {
    if (driverType === 'postgres') {
      return `$${counter++}`;
    } else {
      return '?';
    }
  }

  for (const key in filter) {
    const value = filter[key];

    if (value === undefined) continue;

    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
      clauses.push(`${key} = ${getPlaceholder()}`);
      params.push(value);
      continue;
    }

    type OpType = Operator<T[typeof key]>;
    const operators = value as OpType;

    for (const op in operators) {
      const opValue = operators[op as keyof OpType];

      if (opValue === undefined) continue;

      switch (op) {
        case '$eq':
          clauses.push(`${key} = ${getPlaceholder()}`);
          params.push(opValue);
          break;
        case '$ne':
          clauses.push(`${key} != ${getPlaceholder()}`);
          params.push(opValue);
          break;
        case '$gt':
          clauses.push(`${key} > ${getPlaceholder()}`);
          params.push(opValue);
          break;
        case '$gte':
          clauses.push(`${key} >= ${getPlaceholder()}`);
          params.push(opValue);
          break;
        case '$lt':
          clauses.push(`${key} < ${getPlaceholder()}`);
          params.push(opValue);
          break;
        case '$lte':
          clauses.push(`${key} <= ${getPlaceholder()}`);
          params.push(opValue);
          break;
        case '$like':
          clauses.push(`${key} LIKE ${getPlaceholder()}`);
          params.push(opValue);
          break;
        case '$in':
          if (!Array.isArray(opValue) || opValue.length === 0) {
            clauses.push('0');
          } else {
            clauses.push(`${key} IN (${opValue.map(() => { return getPlaceholder() }).join(', ')})`);
            params.push(...opValue);
          }
          break;
        case '$nin':
          if (!Array.isArray(opValue) || opValue.length === 0) {
            clauses.push('1');
          } else {
            clauses.push(`${key} NOT IN (${opValue.map(() => { return getPlaceholder() }).join(', ')})`);
            params.push(...opValue);
          }
          break;
        case "$like":
          clauses.push(`${key} like ${getPlaceholder()}`);
          params.push(opValue);
          break;
        default:
          throw new Error(`Unsupported operator: ${op}`);
      }
    }
  }

  const sql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
  return { sql, params };
}

export function buildQueryTail<T = unknown>(options?: Partial<Pick<ReadOptions<T>, 'orderBy' | 'limit' | 'offset'>>): string {
  let sql = '';

  if (options?.orderBy) {
    if (Array.isArray(options.orderBy)) {
      sql += ` ORDER BY ${options.orderBy.join(', ')}`;
    } else {
      sql += ` ORDER BY ${options.orderBy as string}`;
    }
  }

  if (typeof options?.limit === 'number') {
    sql += ` LIMIT ${options.limit}`;
  }

  if (typeof options?.offset === 'number') {
    sql += ` OFFSET ${options.offset}`;
  }

  return sql;
}