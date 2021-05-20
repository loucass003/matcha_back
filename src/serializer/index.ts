import { getSerializeData } from './SerializeField';

export function Serialize(instance: any, groups: string[] = []): any {
  const serialize_object = (inst: any): any => {
    const fieldsToReturn = Object.keys(inst)
      .map((field) => ({ field, options: getSerializeData(inst, field) }))
      .filter(
        ({ options }) => options
          && (groups.length === 0
            || (options.groups && options.groups.some((g) => groups.includes(g)))),
      );

    return fieldsToReturn.reduce(
      (obj, { field, options: { format = (value) => value } }) => {
        const transformed_value = format(inst[field]);

        return ({
          ...obj,
          [field]:
          transformed_value
          && (typeof transformed_value === 'object' || Array.isArray(transformed_value))
            ? Serialize(transformed_value, groups)
            : format(transformed_value),
        });
      },
      {},
    );
  };

  if (Array.isArray(instance)) {
    return instance.map((v) => serialize_object(v));
  }
  return serialize_object(instance);
}
