import 'reflect-metadata';

const formatMetadataKey = Symbol('matcha:serialize-field');

interface SerializeOptions {
  groups: string[];
}

export function SerializeField(options?: SerializeOptions) {
  const { groups = [] } = options || {};
  return Reflect.metadata(formatMetadataKey, { groups });
}

export function getSerializeData(
  target: any,
  propertyKey: string,
): SerializeOptions {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
