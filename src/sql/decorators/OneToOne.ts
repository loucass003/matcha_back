import { AnyEntity, RelationTypes } from "../find";
import { ColumnMetas } from "./Column";

export function OneToOne<T = any>(
  targetEntity: AnyEntity<T>
): PropertyDecorator {
  return (target: any, propertyKey) => {
    // eslint-disable-next-line no-underscore-dangle
    target.__columns = {
      // eslint-disable-next-line no-underscore-dangle
      ...(target.__columns || {}),
      [propertyKey]: {
        // eslint-disable-next-line no-underscore-dangle
        ...(target.__columns[propertyKey] || {}),
        relation: {
          type: RelationTypes.OneToOne,
          targetEntity,
        },
      } as ColumnMetas<T>,
    };
  };
}
