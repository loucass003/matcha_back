import { toCamelCase } from "../../utils/string";

const entityMetadataKey = "matcha:sql-entity";

interface EntityOptions {
  tableName?: string;
}

export interface EntityMetadata extends EntityOptions {
  className: string;
}

export function Entity(options: EntityOptions = {}): ClassDecorator {
  return (target) =>
    Reflect.metadata(entityMetadataKey, {
      tableName: options.tableName || toCamelCase(target.name),
      className: target.name,
    } as EntityMetadata)(target);
}

export function getEntityMetadata<T = any>(target: T): EntityMetadata {
  return Reflect.getMetadata(entityMetadataKey, target);
}
