import { getSerializeData } from './SerializeField';

export function Serialize(instance: any, groups: string[] = []): any {
  const serialize_object = (inst: any): any => {
    const fieldsToReturn = Object.keys(inst)
      .map((field) => ({ field, options: getSerializeData(inst, field) }))
      .filter(
        ({ options }) => options
          && (groups.length === 0
            || options.groups.some((g) => groups.includes(g))),
      );

    return fieldsToReturn.reduce((obj, { field }) => {
      if (inst[field] && typeof inst[field] === 'object') {
        return { ...obj, [field]: serialize_object(inst[field]) };
      }
      return { ...obj, [field]: inst[field] };
    }, {});
  };

  if (Array.isArray(instance)) {
    return instance.map((v) => serialize_object(v));
  }
  return serialize_object(instance);
}
