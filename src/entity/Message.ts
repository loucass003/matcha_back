import { Entity } from "../sql/decorators/Entity";
import { Column } from "../sql/decorators/Column";

@Entity()
export class Message {
  @Column()
  id!: number;

  @Column()
  content!: string;
}
