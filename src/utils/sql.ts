import { Client } from "pg";

export function update<T>(
  db: Client,
  table: string,
  values: Partial<T>,
  where: Partial<T>
) {
  const valuesLen = Object.keys(values).length;

  return db.query(
    `UPDATE ${table} 
     SET ${Object.keys(values)
       .map((key, index) => `"${key}" = $${index + 1}`)
       .join(", ")}
     WHERE ${Object.keys(where)
       .map((key, index) => `"${key}" = $${valuesLen + index + 1}`)
       .join(", ")}
    `,
    [...Object.values(values), ...Object.values(where)]
  );
}

export function selectJoin<T>(
  table: string,
  prefix: string,
  fields: (keyof T)[]
) {
  return fields.map((f) => `${table}.${f} as "${prefix}_${f}"`).join(", ");
}

export function mapJoin<T>(prefix: string, fields: (keyof T)[], from: any) {
  return Object.keys(from).reduce((obj, key) => {
    const name = key.replace(`${prefix}_`, "");
    return { ...obj, [name]: from[key] };
  }, {} as T);
}
