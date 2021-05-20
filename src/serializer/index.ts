import { getSerializeData } from "./SerializeField";

export function Serialize(instance: any, groups: string[] = []): any {
  const serializeObject = (inst: any): any => {
    const fieldsToReturn = Object.keys(inst)
      .map((field) => ({ field, options: getSerializeData(inst, field) }))
      .filter(
        ({ options }) =>
          options &&
          (groups.length === 0 ||
            (options.groups && options.groups.some((g) => groups.includes(g))))
      );

    return fieldsToReturn.reduce(
      (obj, { field, options: { format = (value) => value } }) => {
        const transformedValue = format(inst[field]);

        return {
          ...obj,
          [field]:
            transformedValue &&
            (typeof transformedValue === "object" ||
              Array.isArray(transformedValue))
              ? Serialize(transformedValue, groups)
              : format(transformedValue),
        };
      },
      {}
    );
  };

  if (Array.isArray(instance)) {
    return instance.map((v) => serializeObject(v));
  }
  return serializeObject(instance);
}
