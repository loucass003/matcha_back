import { Client } from "pg";
import { v4 } from "uuid";
import { ColumnMetas } from "./decorators/Column";
import { getEntityMetadata } from "./decorators/Entity";

enum QueryUnionType {
  Value = "VALUE",
  Operator = "OPERATOR",
  Query = "QUERY",
  QueryArray = "QUERY_ARRAY",
}

export enum RelationTypes {
  OneToOne = "ONE_TO_ONE",
  OneToMany = "ONE_TO_MANY",
  ManyToOne = "MANY_TO_ONE",
  ManyToMany = "MANY_TO_MANY",
}

export type Relations<T> =
  | { type: RelationTypes.OneToOne; targetEntity: AnyEntity<T> }
  | { type: RelationTypes.OneToMany; targetEntity: AnyEntity<T> }
  | { type: RelationTypes.ManyToOne; targetEntity: AnyEntity<T> }
  | { type: RelationTypes.ManyToMany; targetEntity: AnyEntity<T> };

export type Scalar = boolean | number | string | bigint;

export type AnyEntity<T = any> = Partial<T>;
type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> &
  U[keyof U];
type QueryOperators<T extends Scalar> = {
  like: T;
  gt: T;
  lt: T;
  lte: T;
  gte: T;
  ne: T;
  in: T[];
  custom: { operator: string; test: T };
};
type ArrayT<T> = { [key: number]: T };

type Query<T> = {
  [P in keyof T]?: T[P] extends ArrayT<infer U>
    ? FilterQuery<U>
    : T[P] extends Scalar
    ? AtLeastOne<QueryOperators<T[P]>> | T[P]
    : FilterQuery<T[P]>;
};
// eslint-disable-next-line @typescript-eslint/ban-types
type EntityClass<T extends AnyEntity<T>> = Function & { prototype: T };
type FilterQuery<T> = Query<T> | Query<T>[];

interface FindOptions<T> {
  relations: (keyof T)[];
  limit?: number;
  offset?: number;
}

export function query(db: Client, q: string, fields: any) {
  const match = q.match(/{{(\S+)}}/gm);
  console.log("(INPUT QUERY)", q);
  let finalQuery = q;
  match?.forEach((param, index) => {
    const fieldKey = param.substring(2, param.length - 2);
    if (fields[fieldKey] !== undefined)
      finalQuery = finalQuery.replace(param, `$${index + 1}`);
    else throw new Error(`missing field ${fieldKey} `);
  });
  return db.query(
    finalQuery,
    match?.map((key) => fields[key.substring(2, key.length - 2)])
  );
}

export function getSelectors<T>(entity: EntityClass<T>): string[] {
  const entityMeta = getEntityMetadata(entity);
  // eslint-disable-next-line no-underscore-dangle
  const columns = entity.prototype.__columns as ColumnMetas<T>[];
  console.log(columns);
  return Object.values(columns)
    .filter((column) => column.relation === undefined)
    .map(({ columnName }) => `${entityMeta.tableName}."${columnName}"`);
}

export function getOperator(
  operator: QueryOperators<any>,
  field: string,
  value: string | string[]
): string {
  const oneOperator = (
    operator: string,
    field: string,
    value: string | string[]
  ) => {
    switch (operator) {
      case "gt":
        return `${field} > ${value}`;
      case "gte":
        return `${field} >= ${value}`;
      case "lt":
        return `${field} < ${value}`;
      case "lte":
        return `${field} <= ${value}`;
      case "ne":
        return `${field} != ${value}`;
      case "in":
        if (!Array.isArray(value))
          throw new Error(`operator in should be an array`);
        return `${field} IN (${value.join(", ")})`;
      case "like":
        return `${field} LIKE "${value}"`;
      default:
        throw new Error(`unknown operator ${operator}`);
    }
  };
  return `(${Object.keys(operator)
    .filter((k) => !!(operator as any)[k])
    .map((k) =>
      operator.custom
        ? `${field} ${operator.custom.operator} "${value}"`
        : oneOperator(k, field, `{{${value}_${k}}}`)
    )
    .join(" AND ")})`;
}

export function isScalar(value: any) {
  return ["boolean", "number", "bigint", "string"].find(
    (type) => typeof value === type
  );
}

export function isOperator(value: any) {
  if (value.custom && value.custom.operator) return true;
  return ["like", "gt", "lt", "lte", "gte", "in", "ne"].find(
    (key) => !!value[key]
  );
}

export function getQueryUnionType<T>(filters: FilterQuery<T>): QueryUnionType {
  const operator = isOperator(filters);
  if (isScalar(filters) || operator) {
    if (operator) return QueryUnionType.Operator;
    return QueryUnionType.Value;
  }
  if (Array.isArray(filters)) return QueryUnionType.QueryArray;
  return QueryUnionType.Query;
}

export function getWheres<T>(
  entity: EntityClass<T>,
  filters: FilterQuery<T>
): { values: any; where: string } {
  let values = {} as Record<string, any>;
  let where = "(";
  let i = 0;
  const entityMeta = getEntityMetadata(entity);
  // eslint-disable-next-line no-underscore-dangle
  const columns = entity.prototype.__columns as Record<string, ColumnMetas<T>>;

  const queryType = getQueryUnionType(filters);
  if (queryType === QueryUnionType.QueryArray && Array.isArray(filters)) {
    const ors = filters.map((v) => getWheres(entity, v));
    return {
      values: ors.reduce(
        (obj, { values: orValues }) => ({
          ...obj,
          ...orValues,
        }),
        {}
      ),
      where: ors.map(({ where }) => where).join(" OR "),
    };
  }

  for (const [filterKey, filterValue] of Object.entries(filters)) {
    if (i > 0) where += " AND ";
    i += 1;
    const queryType = getQueryUnionType(filterValue);
    const column = columns[filterKey];
    const valueFieldKey = `${v4()}_${entityMeta.tableName}_${filterKey}`;
    if (queryType === QueryUnionType.Value) {
      values[valueFieldKey] = filterValue;
      where += `"${entityMeta.tableName}"."${column.columnName}" = {{${valueFieldKey}}}`;
    } else if (queryType === QueryUnionType.Operator) {
      where += getOperator(
        filterValue,
        `"${entityMeta.tableName}"."${column.columnName}"`,
        valueFieldKey
      );
      values = {
        ...values,
        ...Object.keys(filterValue)
          .filter((key) => !!filterValue[key])
          .reduce(
            (obj, key) => ({
              ...obj,
              [`${valueFieldKey}_${key}`]:
                key === "custom" ? filterValue[key].test : filterValue[key],
            }),
            {}
          ),
      };
    } else if (queryType === QueryUnionType.QueryArray) {
      const { where: newWheres, values: newValues } = getWheres(
        entity,
        filterValue
      );
      values = { ...values, ...newValues };
      where += ` OR (${newWheres})`;
    }
  }

  where += ")";

  return {
    values,
    where,
  };
}

export async function find<T extends AnyEntity<T>>(
  db: Client,
  entity: EntityClass<T>,
  filters: FilterQuery<T>,
  options: FindOptions<T> = { relations: [] }
): Promise<T[] | null> {
  const entityMeta = getEntityMetadata(entity);

  const { where, values } = getWheres(entity, filters);
  const hasWheres = Object.keys(values).length !== 0;
  console.log(entityMeta, filters, options, values);
  return (
    await query(
      db,
      `SELECT ${getSelectors<T>(entity).join(", ")} FROM ${
        entityMeta.tableName
      }${hasWheres ? ` WHERE ${where}` : ""}${
        options.limit ? ` LIMIT ${options.limit}` : ""
      }${options.offset ? ` OFFSET ${options.offset}` : ""}
    `,
      values
    )
  ).rows;
}
