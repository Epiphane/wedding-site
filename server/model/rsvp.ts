import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm"
import Guest from "./guest";

@Entity()
export default class RSVP extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  createdAt: Date;

  @Column()
  attending: boolean;

  @Column()
  plusOne: boolean;
}
