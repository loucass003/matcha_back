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
