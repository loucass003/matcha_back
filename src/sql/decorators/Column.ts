import { toCamelCase } from "../../utils/string";
import { Relations } from "../find";

interface ColumnOptions<T> {
  columnName?: string;
  primary?: boolean;
  onUpdate?: (entity: T) => any;
  onCreate?: (entity: T) => any;
}

export interface ColumnMetas<T> extends ColumnOptions<T> {
  fieldName: string;
  relation?: Relations<T>;
}

export function Column<T = any>(
  options: ColumnOptions<T> = {}
): PropertyDecorator {
  return (target: any, propertyKey) => {
    const {
      columnName = toCamelCase(propertyKey as string),
      onUpdate = (entity) => entity,
      onCreate = (entity) => entity,
      primary = false,
    } = options;

    // eslint-disable-next-line no-underscore-dangle
    target.__columns = {
      // eslint-disable-next-line no-underscore-dangle
      ...(target.__columns || {}),
      [propertyKey]: {
        columnName,
        onUpdate,
        onCreate,
        primary,
        fieldName: propertyKey,
      } as ColumnMetas<T>,
    };
  };
}
