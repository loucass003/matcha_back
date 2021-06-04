import { getEntityMetadata } from "./decorators/Entity";

export function registerEntities(entities: any[]) {
  entities.forEach((eClass) => {
    console.log(getEntityMetadata(eClass));
  });
}
