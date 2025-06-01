export function buildWhere(filter) {
    const clauses = [];
    const params = [];
    for (const key in filter) {
        const value = filter[key];
        if (value === undefined)
            continue;
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            clauses.push(`${key} = ?`);
            params.push(value);
            continue;
        }
        const operators = value;
        for (const op in operators) {
            const opValue = operators[op];
            if (opValue === undefined)
                continue;
            switch (op) {
                case '$eq':
                    clauses.push(`${key} = ?`);
                    params.push(opValue);
                    break;
                case '$ne':
                    clauses.push(`${key} != ?`);
                    params.push(opValue);
                    break;
                case '$gt':
                    clauses.push(`${key} > ?`);
                    params.push(opValue);
                    break;
                case '$gte':
                    clauses.push(`${key} >= ?`);
                    params.push(opValue);
                    break;
                case '$lt':
                    clauses.push(`${key} < ?`);
                    params.push(opValue);
                    break;
                case '$lte':
                    clauses.push(`${key} <= ?`);
                    params.push(opValue);
                    break;
                case '$like':
                    clauses.push(`${key} LIKE ?`);
                    params.push(opValue);
                    break;
                case '$in':
                    if (!Array.isArray(opValue) || opValue.length === 0) {
                        clauses.push('0');
                    }
                    else {
                        clauses.push(`${key} IN (${opValue.map(() => '?').join(', ')})`);
                        params.push(...opValue);
                    }
                    break;
                case '$nin':
                    if (!Array.isArray(opValue) || opValue.length === 0) {
                        clauses.push('1');
                    }
                    else {
                        clauses.push(`${key} NOT IN (${opValue.map(() => '?').join(', ')})`);
                        params.push(...opValue);
                    }
                    break;
                default:
                    throw new Error(`Unsupported operator: ${op}`);
            }
        }
    }
    const sql = clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '';
    return { sql, params };
}
export function buildQueryTail(options) {
    let sql = '';
    if (options?.orderBy) {
        sql += ` ORDER BY ${options.orderBy.join(', ')}`;
    }
    if (typeof options?.limit === 'number') {
        sql += ` LIMIT ${options.limit}`;
    }
    if (typeof options?.offset === 'number') {
        sql += ` OFFSET ${options.offset}`;
    }
    return sql;
}
