import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm"
import Guest from "./guest";
import { IsBoolean, IsString } from "class-validator";
import { isBoolean } from "lodash";

@Entity()
export default class RSVP extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Guest)
  guest: Guest;

  @Column()
  responseTime: Date;

  @Column()
  @IsBoolean()
  attending: boolean;

  @Column()
  @IsBoolean()
  plusOne: boolean;

  @Column()
  @IsString()
  plusOneName: string;

  toJSON() {
    const { guest, id, ...rest } = this;
    return rest;
  }
}
