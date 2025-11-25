import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm"
import Guest from "./guest";
import { IsNumber, IsString } from "class-validator";

class Transform {
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

@Entity()
export default class Sticker extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Guest, (guest) => guest.stickers)
  owner: Guest;

  @Column()
  @IsString()
  type: 'image' | 'text';

  @Column()
  @IsString()
  content: string;

  @Column()
  @IsNumber()
  x: number;

  @Column()
  @IsNumber()
  y: number;

  @Column()
  @IsNumber()
  rotation: number;

  @Column()
  @IsNumber()
  scale: number;

  toJSON() {
    const { owner, ...rest } = this;
    return rest;
  }
}
