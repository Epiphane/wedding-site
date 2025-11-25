import { Entity, PrimaryGeneratedColumn, Column, BaseEntity, JoinColumn, OneToOne, OneToMany } from "typeorm"
import RSVP from "./rsvp"
import { IsEmail, IsString } from "class-validator"
import Sticker from "./sticker"

@Entity()
export default class Guest extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  @IsString()
  name: string

  @Column()
  @IsEmail()
  email: string

  @OneToOne(() => RSVP)
  @JoinColumn()
  response: RSVP

  @OneToMany(() => Sticker, (sticker) => sticker.owner)
  @JoinColumn()
  stickers: Sticker[];
}
