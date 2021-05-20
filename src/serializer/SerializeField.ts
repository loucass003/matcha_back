import "reflect-metadata";
import { Validator } from "../validation/Validator";

const formatMetadataKey = Symbol("matcha:serialize-field");

interface SerializeOptions<Input, Output> {
  groups?: string[];
  format?: Validator<Input, Output>;
}

export function SerializeField<Input = any, Output = any>(
  options?: SerializeOptions<Input, Output>
) {
  const { groups = [], format } = options || {};
  return Reflect.metadata(formatMetadataKey, { groups, format });
}

export function getSerializeData(
  target: any,
  propertyKey: string
): SerializeOptions<any, any> {
  return Reflect.getMetadata(formatMetadataKey, target, propertyKey);
}
