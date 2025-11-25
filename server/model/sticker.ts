import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne } from "typeorm"
import Guest from "./guest";

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
  type: 'image' | 'text';

  @Column()
  content: string;

  @Column()
  x: number;

  @Column()
  y: number;

  @Column()
  rotation: number;

  @Column()
  scale: number;
}
